import { 
  Globe, Users, Heart, ShieldCheck, Cpu, 
  CreditCard, BarChart3, Scale, ShieldAlert, Wrench, Layout
} from 'lucide-vue-next';

export const presentationCategories = [
  { id: 'all', label: 'All Categories', icon: Layout },
  { id: 'MARKETING', label: 'Marketing', icon: Globe },
  { id: 'HRD_GA', label: 'HRD & GA', icon: Users },
  { id: 'TEKNIK', label: 'Teknik', icon: Wrench },
  { id: 'EMPLOYEE_BENEFIT', label: 'Employee Benefit', icon: Heart },
  { id: 'CLAIM', label: 'Claim', icon: ShieldCheck },
  { id: 'IT', label: 'IT', icon: Cpu },
  { id: 'ACCOUNTING_FINANCE', label: 'Accounting & Finance', icon: CreditCard },
  { id: 'MANAJEMEN', label: 'Manajemen', icon: BarChart3 },
  { id: 'LEGAL', label: 'Legal', icon: Scale },
  { id: 'RISK_MANAGEMENT', label: 'Risk Management', icon: ShieldAlert }
];
