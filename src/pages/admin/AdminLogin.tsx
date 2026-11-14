import { Navigate } from "react-router-dom";

/**
 * /admin, the address the admin app is opened at.
 *
 * There is no login form any more: Cloudflare Access sits in front of /admin
 * and signs the owner in with a one-time code by email before this page ever
 * loads. Reaching it means the session is good, so go straight to orders.
 */
const AdminLogin = () => <Navigate to="/admin/orders" replace />;

export default AdminLogin;
