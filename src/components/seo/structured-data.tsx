'use client';

import { StructuredData } from '@/lib/structured-data';

interface StructuredDataProps {
  data: StructuredData | StructuredData[];
}

// Sanitize structured data to prevent XSS
function sanitizeStructuredData(data: StructuredData): StructuredData {
  // Create a deep copy and sanitize string values
  const sanitized = JSON.parse(JSON.stringify(data));
  
  function sanitizeValue(obj: any): any {
    if (typeof obj === 'string') {
      // Remove potentially dangerous characters that could break JSON context
      return obj.replace(/[<>"'&\\]/g, (char) => {
        const map: { [key: string]: string } = {
          '<': '\\u003C',
          '>': '\\u003E',
          '"': '\\u0022', 
          "'": '\\u0027',
          '&': '\\u0026',
          '\\': '\\u005C'
        };
        return map[char] || char;
      });
    } else if (Array.isArray(obj)) {
      return obj.map(sanitizeValue);
    } else if (obj && typeof obj === 'object') {
      const sanitizedObj: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitizedObj[key] = sanitizeValue(value);
      }
      return sanitizedObj;
    }
    return obj;
  }
  
  return sanitizeValue(sanitized);
}

export function StructuredDataScript({ data }: StructuredDataProps) {
  const jsonData = Array.isArray(data) ? data : [data];
  
  return (
    <>
      {jsonData.map((item, index) => {
        const sanitizedItem = sanitizeStructuredData(item);
        const jsonString = JSON.stringify(sanitizedItem, null, 0);
        
        return (
          <script
            key={index}
            type="application/ld+json"
            // Additional safety: ensure the JSON is properly escaped
            dangerouslySetInnerHTML={{
              __html: jsonString,
            }}
          />
        );
      })}
    </>
  );
}