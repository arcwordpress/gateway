import React, { useState, useEffect, useMemo, useRef } from 'react'; // Remove createContext, useContext
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getCollection, getRecord, updateRecord } from '../services/api';
import { generateZodSchema } from '../utils/zodSchemaGenerator';
import { createGatewayFormContext, GatewayFormContext } from '../utils/gatewayFormContext'; // Add imports

// Remove these definitions (now in gatewayFormContext.js)
// export const GatewayFormContext = createContext();
// export const useGatewayForm = () => { ... };
// export const useGatewayFormField = (name) => { ... };

// ...existing code (AppForm component remains the same)...

// Change export to only the component
export { AppForm };

// Remove any other exports