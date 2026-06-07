import {
  Archive,
  BarChart3,
  Bell,
  BookOpen,
  Box,
  FileText,
  LineChart,
  Mail,
  Scale,
  Search,
  Trash2
} from "lucide-react";

export const recentChats = [
  {
    title: "Estudio de mercado",
    subtitle: "Dapagliflozina",
    time: "10:24",
    active: true
  },
  {
    title: "Prórroga contrato",
    subtitle: "2023LE-000015",
    time: "Ayer",
    active: false
  },
  {
    title: "Comparación de precios",
    subtitle: "Enfortumab vedotina",
    time: "Ayer",
    active: false
  },
  {
    title: "Inventario Oncológicos",
    subtitle: "Mayo 2026",
    time: "2 días",
    active: false
  },
  {
    title: "Redactar oficio",
    subtitle: "Solicitud información",
    time: "2 días",
    active: false
  }
];

export const recentFiles = [
  {
    code: "2023LE-000015-0001102208",
    name: "Dapagliflozina"
  },
  {
    code: "2025LE-000002-000210142",
    name: "Enfortumab vedotina"
  },
  {
    code: "2024CD-000123-000440001",
    name: "Catéteres"
  }
];

export const quickActions = [
  {
    label: "Buscar en SICOP",
    icon: Search,
    prompt: "Buscar en SICOP concursos recientes del medicamento indicado."
  },
  {
    label: "Estudio de mercado",
    icon: BarChart3,
    prompt: "Generar un estudio de mercado con precio promedio, mediana y desviación estándar."
  },
  {
    label: "Comparar precios",
    icon: Scale,
    prompt: "Comparar precios contra expedientes similares y calcular diferencia porcentual."
  },
  {
    label: "Redactar oficio",
    icon: FileText,
    prompt: "Redactar un oficio institucional con tono formal y estructura CCSS."
  },
  {
    label: "Revisar inventario",
    icon: Box,
    prompt: "Revisar inventario, días de abastecimiento y productos próximos a vencer."
  },
  {
    label: "Normativa aplicable",
    icon: BookOpen,
    prompt: "Identificar normativa aplicable y criterios técnicos relevantes."
  },
  {
    label: "Análisis de contrato",
    icon: Archive,
    prompt: "Analizar contrato, vigencia, prórrogas, consumo y saldo disponible."
  },
  {
    label: "Generar alerta",
    icon: Bell,
    prompt: "Crear una alerta para dar seguimiento a este expediente."
  },
  {
    label: "Revisar email",
    icon: Mail,
    prompt: "Revisar el correo electrónico y resumir los mensajes pendientes e importantes."
  }
];

export const supportActions = [
  {
    label: "Limpiar memoria",
    icon: Trash2
  },
  {
    label: "Reporte de uso",
    icon: LineChart
  }
];

export const sicopRows = [
  {
    procedure: "2024LA-000012-000210142",
    institution: "CCSS - Hospital México",
    date: "15/04/2025",
    price: "₡1.350,00",
    status: "Adjudicado"
  },
  {
    procedure: "2024LA-000045-000210142",
    institution: "CCSS - Hospital San Juan",
    date: "28/03/2025",
    price: "₡1.320,00",
    status: "Adjudicado"
  },
  {
    procedure: "2024LA-000098-000210142",
    institution: "CCSS - Hospital Calderón",
    date: "10/02/2025",
    price: "₡1.410,00",
    status: "Adjudicado"
  },
  {
    procedure: "2024LA-000156-000210142",
    institution: "CCSS - Hospital Escalante",
    date: "20/12/2024",
    price: "₡1.300,00",
    status: "Adjudicado"
  },
  {
    procedure: "2024LA-000201-000210142",
    institution: "CCSS - Hospital Max Peralta",
    date: "05/11/2024",
    price: "₡1.380,00",
    status: "Adjudicado"
  }
];
