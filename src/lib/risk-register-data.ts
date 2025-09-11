// lib/risk-register-data.ts

export type RiskRegisterData = {
  id?: number;           
  no: number;            
  potensiRisiko: string; 
  penyebab: string;      
  dampak: string;        
  existingControl: string; 
  levelRisiko: string;  
  unit_id: number;       
  unit_name: string;     
};
