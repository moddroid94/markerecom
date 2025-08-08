import { NeonShift3D } from "@/components/neon-shift-3d";

export default function Home() {
  return (
    <div className="bg-background">
      <div className="h-screen w-full fixed top-0 left-0 z-0">
        <NeonShift3D />
      </div>
      <main className="relative z-10">
        <div className="h-screen flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] font-headline">
            NeonShift 3D
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl font-body">
            An interactive 3D scene. Scroll to rotate, drag to explore, and click to transform.
          </p>
        </div>
        
        <div className="h-screen bg-background">
          <div className="max-w-4xl mx-auto p-8 pt-32 space-y-12">
            <h2 className="text-4xl font-bold text-center text-primary font-headline">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6 border rounded-lg border-primary/50 bg-background/50 backdrop-blur-sm">
                <h3 className="text-2xl font-semibold text-accent font-headline">Scroll to Rotate</h3>
                <p className="mt-2 text-muted-foreground font-body">The object's orientation is tied to your scroll position.</p>
              </div>
              <div className="p-6 border rounded-lg border-primary/50 bg-background/50 backdrop-blur-sm">
                <h3 className="text-2xl font-semibold text-accent font-headline">Drag to Orbit</h3>
                <p className="mt-2 text-muted-foreground font-body">Take control and inspect the object from any side.</p>
              </div>
              <div className="p-6 border rounded-lg border-primary/50 bg-background/50 backdrop-blur-sm">
                <h3 className="text-2xl font-semibold text-accent font-headline">Click to Shift</h3>
                <p className="mt-2 text-muted-foreground font-body">A single click alters the object's core material.</p>
              </div>
            </div>
            <p className="text-lg text-center text-muted-foreground font-body">
              Built with Next.js, Tailwind CSS, and Three.js. This demo showcases how modern web technologies can create immersive and interactive experiences directly in your browser.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
