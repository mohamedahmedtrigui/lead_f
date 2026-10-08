import {
  ClipboardList,
  FileSpreadsheet,
  History,
  LayoutDashboard,
  ListChecks,
  MessageSquareText,
  PhoneCall,
  Users,
} from 'lucide-react'
import { ROLES } from '@/constants/domain'

export const NAVIGATION = {
  [ROLES.DISPATCHER]: [
    { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
    { to: '/leads', label: 'Mes leads', icon: ListChecks },
  ],
  [ROLES.ADMIN]: [
    { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
    { to: '/admin/leads', label: 'Leads', icon: ClipboardList },
    { to: '/admin/import', label: 'Import CSV', icon: FileSpreadsheet },
    { to: '/admin/dispatchers', label: 'Dispatchers', icon: Users },
    { to: '/admin/script', label: 'Script d’appel', icon: MessageSquareText },
    { to: '/admin/calls', label: 'Historique appels', icon: PhoneCall },
    { to: '/admin/audit', label: 'Journal d’audit', icon: History },
  ],
}
