import { auth } from "@/app/_lib/auth";
console.log("triggered middleware");

export const middleware = auth;

export const config = {
  matcher: ["/account"],
};
