
export const DEPARTMENTS = [
  { id: 'CEO_OFFICE', name: 'CEO's Office' },
  { id: 'CONSUMER', name: 'Consumer' },
  { id: 'CORP_AFF', name: 'Corporate Affairs' },
  { id: 'COPS&CEX', name: 'Customer Operations and Customer Experience' },
  { id: 'EBU', name: 'EBU' },
  { id: 'FINANCE', name: 'Finance' },
  { id: 'HR', name: 'Human Resources' },
  { id: 'INT_AU_F', name: 'Internal Audit & Forensics' },
  { id: 'IT', name: 'IT' },
  { id: 'Network', name: 'Network' },
  { id: 'RISK_COMP', name: 'Risk & Compliance' },
  { id: 'SALES_D', name: 'Sales & Distribution' },
  { id: 'PROCUREMENT', name: 'Procurement' },
  { id: 'SECURITY_OFFICE', name: 'Security & Safety Office' },
  { id: 'KYC_OFFICE', name: 'KYC_Office' },
];

// Generate visitor cards for each department
export const generateDepartmentCards = (department) => {
  const cards = [];
  for (let i = 1; i <= 20; i++) {
    const cardNumber = i.toString().padStart(2, '0');
    cards.push(`${department}-${cardNumber}`);
  }
  return cards;
};

export const ID_FORMATS = {
  NATIONAL_ID: /^\d{16}$/,
  PHONE: /^250\d{9}$/,
  PASSPORT: '#00'
};

export const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_PHONE: 'Phone number must start with 250 followed by 9 digits',
  INVALID_ID: 'ID must be 16 digits',
  SERVER_ERROR: 'An error occurred. Please try again.',
  NO_CARDS: 'No visitor cards available for this department'
};
