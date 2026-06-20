import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => {
    const variants = {
      default:
        "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500",
      outline:
        "border border-rose-600 text-rose-600 hover:bg-rose-50 focus:ring-rose-500",
      ghost: "text-rose-600 hover:bg-rose-50 focus:ring-rose-500",
      destructive:
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
      secondary:
        "bg-amber-100 text-amber-900 hover:bg-amber-200 focus:ring-amber-500",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
