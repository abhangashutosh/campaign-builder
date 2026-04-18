import { AppShell } from '@/components/layout/app-shell'

export default function PluginLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
