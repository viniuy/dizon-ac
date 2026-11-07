// A template remounts on every navigation. It only fades: moving it would drag the fixed
// glance panel along, so each page's own sections rise in one after another (STAGGER) instead.
export default function StaffTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-in fade-in-0 duration-300">{children}</div>
}
