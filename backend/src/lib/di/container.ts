import { container } from 'tsyringe';
import { Logger } from '../logger/logger.js';
import { TOKENS } from './tokens.js';

// service
import { UserService } from '../../app/users/service/users.service.js';
import { RestaurantService } from '../../app/restaurant/service/restaurant.service.js';
import { BranchService } from '../../app/branch/service/branch.service.js';
import { ProductService } from '../../app/product/service/product.service.js';
import { MemberService } from '../../app/rbac/service/member.service.js';
import { CustomerAddressService } from '../../app/customer_address/service/customer_address.service.js';
import { PermissionCacheService } from '../../app/rbac/service/permission-cache.service.js';
import { AuthService } from '../../app/auth/service/auth.service.js';

// controller
import { AuthController } from '../../app/auth/controller/auth.controller.js';
import { UsersController } from '../../app/users/controller/users.controller.js';
import { RestaurantController } from '../../app/restaurant/controller/restaurant.controller.js';
import { BranchController } from '../../app/branch/controller/branch.controller.js';
import { ProductController } from '../../app/product/controller/product.controller.js';
import { MemberController } from '../../app/rbac/controller/member.controller.js';
import { CustomerAddressController } from '../../app/customer_address/controller/customer_address.controller.js';
import { ICacheProvider } from '../cache/cache.interface.js';
import { RedisCacheProvider } from '../cache/redis.js';
import { MailjetEmailProvider } from '../email/mailjet.js';
import { OrderService } from '../../app/order/service/order.service.js';
import { OrderController } from '../../app/order/controller/order.controller.js';
import { kashierClient } from '../payments/kashier/kashier.client.js';
import { PaymentService } from '../../app/payment/service/payment.service.js';
import { WebhookController } from '../../app/payment/controller/webhook.controller.js';
import { KashierWebhookService } from '../../app/payment/service/kashier-webhook.service.js';

// Infrastructure
container.registerSingleton<Logger>(TOKENS.Logger, Logger);
container.registerSingleton<ICacheProvider>(TOKENS.CacheProvider, RedisCacheProvider);
container.registerSingleton(TOKENS.EmailProvider, MailjetEmailProvider);
container.registerInstance(TOKENS.KashierProvider, kashierClient);

// Service
container.registerSingleton<UserService>(TOKENS.UserService, UserService);
container.registerSingleton<RestaurantService>(TOKENS.RestaurantService, RestaurantService);
container.registerSingleton<BranchService>(TOKENS.BranchService, BranchService);
container.registerSingleton<ProductService>(TOKENS.ProductService, ProductService);
container.registerSingleton<MemberService>(TOKENS.MemberService, MemberService);
container.registerSingleton<CustomerAddressService>(TOKENS.CustomerAddressService, CustomerAddressService);
container.registerSingleton<PermissionCacheService>(TOKENS.PermissionCacheService, PermissionCacheService);
container.registerSingleton<AuthService>(TOKENS.AuthService, AuthService);
container.registerSingleton<OrderService>(TOKENS.OrderService, OrderService);
container.registerSingleton<PaymentService>(TOKENS.PaymentService, PaymentService);
container.registerSingleton<KashierWebhookService>(TOKENS.KashierWebhookService, KashierWebhookService);

// Controller
container.registerSingleton<AuthController>(TOKENS.AuthController, AuthController);
container.registerSingleton<UsersController>(TOKENS.UserController, UsersController);
container.registerSingleton<RestaurantController>(TOKENS.RestaurantController, RestaurantController);
container.registerSingleton<BranchController>(TOKENS.BranchController, BranchController);
container.registerSingleton<ProductController>(TOKENS.ProductController, ProductController);
container.registerSingleton<MemberController>(TOKENS.MemberController, MemberController);
container.registerSingleton<CustomerAddressController>(TOKENS.CustomerAddressController, CustomerAddressController);
container.registerSingleton<OrderController>(TOKENS.OrderController, OrderController);
container.registerSingleton<WebhookController>(TOKENS.WebhookController, WebhookController);

export { container };
