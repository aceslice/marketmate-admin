import Image from "next/image";
import { ArrowRight, Package, Truck, Users, DollarSign } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-2">
            <Image
              src="/vercel.svg"
              alt="MarketMate Logo"
              width={40}
              height={40}
              className="dark:invert"
            />
            <h1 className="text-2xl font-bold">MarketMate Admin</h1>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-colors"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Hero Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Streamline Your Delivery Operations
            </h2>
            <p className="text-lg text-muted-foreground">
              Manage orders, track deliveries, and optimize your logistics with
              our powerful admin dashboard.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-colors text-lg"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="relative h-[400px] rounded-2xl overflow-hidden border bg-card">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
            <div className="absolute inset-0 p-6">
              <div className="grid grid-cols-2 gap-4 h-full">
                <div className="space-y-4">
                  <div className="h-24 rounded-lg bg-background/50 backdrop-blur-sm p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="w-4 h-4" />
                      <span>Total Orders</span>
                    </div>
                    <p className="text-2xl font-bold mt-2">1,234</p>
                  </div>
                  <div className="h-24 rounded-lg bg-background/50 backdrop-blur-sm p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Truck className="w-4 h-4" />
                      <span>Active Deliveries</span>
                    </div>
                    <p className="text-2xl font-bold mt-2">42</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-24 rounded-lg bg-background/50 backdrop-blur-sm p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>Active Couriers</span>
                    </div>
                    <p className="text-2xl font-bold mt-2">28</p>
                  </div>
                  <div className="h-24 rounded-lg bg-background/50 backdrop-blur-sm p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="w-4 h-4" />
                      <span>Revenue Today</span>
                    </div>
                    <p className="text-2xl font-bold mt-2">$8,432</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="p-6 rounded-2xl border bg-card hover:border-primary/50 transition-colors">
            <Package className="w-8 h-8 mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Order Management</h3>
            <p className="text-muted-foreground">
              Track and manage all your orders in real-time with our intuitive
              interface.
            </p>
          </div>
          <div className="p-6 rounded-2xl border bg-card hover:border-primary/50 transition-colors">
            <Truck className="w-8 h-8 mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Delivery Tracking</h3>
            <p className="text-muted-foreground">
              Monitor deliveries and optimize routes for maximum efficiency.
            </p>
          </div>
          <div className="p-6 rounded-2xl border bg-card hover:border-primary/50 transition-colors">
            <Users className="w-8 h-8 mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Courier Management</h3>
            <p className="text-muted-foreground">
              Manage your delivery team and track their performance metrics.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
          <Link
            href="/dashboard"
            className="hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/orders"
            className="hover:text-foreground transition-colors"
          >
            Orders
          </Link>
          <Link
            href="/couriers"
            className="hover:text-foreground transition-colors"
          >
            Couriers
          </Link>
          <Link
            href="/analytics"
            className="hover:text-foreground transition-colors"
          >
            Analytics
          </Link>
        </footer>
      </div>
    </div>
  );
}
