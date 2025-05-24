import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Star, Ticket, Home } from "lucide-react";

const items = [
  {
    title: "Início",
    href: "/",
    icon: Home
  },
  {
    title: "Meus Bolões",
    href: "/meus-boloes",
    icon: Ticket
  },
  {
    title: "Favoritos",
    href: "/favoritos",
    icon: Star
  }
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            pathname === item.href
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.title}
        </Link>
      ))}
    </nav>
  );
} 