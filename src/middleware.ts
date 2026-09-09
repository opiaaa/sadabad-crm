import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/leads/:path*",
    "/properties/:path*",
    "/talepler/:path*",
    "/tasks/:path*",
  ],
};
