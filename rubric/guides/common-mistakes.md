# Common Rubric Mistakes & Anti-Patterns

## DON'T: Modify Constraints When They Feel Limiting

❌ **Wrong Approach:**
```javascript
// "I need to add console.log for debugging, let me change the .rux file"
// *modifies product-service.rux to remove 'deny io.console.*'*
✅ Correct Approach:
javascript// Create a dedicated debug service that CAN use console
// Or use a proper logging service that's allowed to do I/O
DON'T: Skip Architectural Layers
❌ Wrong - Component directly accessing database:
typescript// In ProductCard.tsx
import { supabase } from '../../lib/supabase';

const ProductCard = ({ productId }) => {
  const [product, setProduct] = useState(null);
  
  useEffect(() => {
    // VIOLATION: UI component making database calls
    supabase.from('products').select('*').eq('id', productId)
      .then(({ data }) => setProduct(data));
  }, [productId]);
}
✅ Correct - Following the layer hierarchy:
typescript// In ProductCard.tsx
import { useProductStore } from '../../stores/product-store';

const ProductCard = ({ productId }) => {
  const product = useProductStore(state => state.getProduct(productId));
  const fetchProduct = useProductStore(state => state.fetchProduct);
  
  useEffect(() => {
    fetchProduct(productId); // Store → Service → Database
  }, [productId]);
}
DON'T: Mix Business Logic with UI Logic
❌ Wrong - Business logic in component:
typescript// In CartSummary.tsx
const CartSummary = ({ items }) => {
  // VIOLATION: Tax calculation is business logic
  const calculateTax = (subtotal) => {
    const taxRate = subtotal > 100 ? 0.08 : 0.10;
    return subtotal * taxRate;
  };
  
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const tax = calculateTax(subtotal);
}
✅ Correct - Business logic in service:
typescript// In CartSummary.tsx
import { useCartStore } from '../../stores/cart-store';

const CartSummary = () => {
  const { subtotal, tax, total } = useCartStore(state => state.getSummary());
  // Just display the values, don't calculate them
}
DON'T: Expose Implementation Details
❌ Wrong - Leaking database client:
typescript// In order-service.ts
export class OrderService {
  constructor(public supabase: SupabaseClient) {} // PUBLIC = BAD
}

// Now components might try to use orderService.supabase directly
✅ Correct - Hide implementation:
typescript// In order-service.ts
export class OrderService {
  constructor(private supabase: SupabaseClient) {} // PRIVATE = GOOD
  
  // Only expose business operations
  async createOrder(items: CartItem[]): Promise<Order> {
    // Implementation hidden
  }
}
DON'T: Create Circular Dependencies
❌ Wrong - Store importing from component:
typescript// In product-store.ts
import { ProductCard } from '../components/ProductCard'; // VIOLATION!
import { formatPrice } from '../components/PriceDisplay'; // VIOLATION!
✅ Correct - Shared utilities in proper location:
typescript// In product-store.ts
import { formatPrice } from '../utils/formatters'; // Shared utilities
import { ProductService } from '../services/product-service'; // Correct direction
DON'T: Ignore Layer Boundaries in "Special Cases"
❌ Wrong thinking:
"Just this once, I'll have the component call the API directly because it's simpler"
✅ Correct thinking:
"If it seems simpler to break the rules, I'm probably missing a pattern. Let me think about the right way to model this."
DON'T: Put Multiple Responsibilities in One Module
❌ Wrong - Service doing too much:
typescript// In user-service.ts
export class UserService {
  async createUser() { }
  async authenticateUser() { }
  async sendEmail() { }  // Should be in EmailService
  async processPayment() { } // Should be in PaymentService
  async generateReport() { } // Should be in ReportService
}
✅ Correct - Single responsibility:
typescript// Each service handles one domain
export class UserService { /* user CRUD operations only */ }
export class AuthService { /* authentication only */ }
export class EmailService { /* email sending only */ }
Remember: Constraints Are Your Friends
Constraints aren't obstacles - they're guardrails that:

Prevent architectural decay
Make the codebase predictable
Enable safe refactoring
Reduce decision fatigue
Improve team collaboration

When you feel like breaking a constraint, ask yourself:

What pattern am I missing?
Should I create a new module with different constraints?
Am I putting logic in the wrong layer?


---

## 📄 .rubric/examples/data-layer/supabase-client.rux

```rubric
module SupabaseClient {
  @ "Centralized Supabase client configuration and access.
  @ This is the ONLY module that should import from @supabase/supabase-js.
  @ All database operations must go through service layer, not use this directly."
  
  location: "src/data/supabase-client.ts"
  
  interface {
    @ "Export only the typed client, not the raw Supabase instance"
    public getClient() -> SupabaseClient
    public isAuthenticated() -> Promise<boolean>
  }
  
  state {
    private _client: SupabaseClient
    private _initialized: boolean
  }
  
  imports {
    allow "@supabase/supabase-js" as external
    allow "../config/environment" as {SUPABASE_URL, SUPABASE_ANON_KEY}
  }
  
  constraints {
    deny imports ["react", "vue", "@angular"]  @ "Data layer is framework-agnostic"
    deny exports ["createClient"]              @ "Don't expose Supabase internals"
    deny exports ["_*"]                        @ "No private members"
    allow io.network.*                         @ "This module manages the connection"
  }
}