import Funnel from '@/components/Funnel';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8 relative">
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(30,80,60,0.18) 0%, transparent 70%)',
        }}
      />
      <Funnel />
    </main>
  );
}
