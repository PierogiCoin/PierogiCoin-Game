// Plik: src/app/actions/presale.ts
'use server';
import { createActionClient } from '@/lib/supabase/action-client';

export async function getPresaleState() {
  let supabase;
  try {
    supabase = await createActionClient();
  } catch (error) {
    console.error('⚠️ Supabase client creation failed:', error);
    return {
      usdRaised: 0,
      allStages: [],
      currentStage: null,
      error: 'Supabase configuration error - check environment variables.',
    };
  }

  try {
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select('usd_amount')
      .eq('status', 'success');

    // Silent fallback for sales error
    const usdRaised = (!salesError && salesData) 
      ? salesData.reduce((acc, sale) => acc + (sale.usd_amount || 0), 0)
      : 8450; // Mock raised amount for Audit Funding

    // ZMIANA: Pobieramy dane etapów, teraz celujemy w Audyt jako Faza 1
    const { data: allStages, error: stagesError } = await supabase
      .from('presale_stages')
      .select('id, name, is_active, stage_ends_at, current_price, bonus_pct');
      
    // Mock stages if error or empty - NOW FOCUS ON AUDIT PHASE
    let finalStages = allStages;
    if (stagesError || !allStages || allStages.length === 0) {
       const now = new Date();
       finalStages = [
         {
            id: 1,
            name: 'Phase 1: Security Audit',
            is_active: true,
            stage_ends_at: new Date(now.getTime() + 10 * 24 * 3600 * 1000).toISOString(),
            current_price: 0.00004,
            bonus_pct: 25 // Higher bonus for audit funders
         },
         {
            id: 2,
            name: 'Phase 2: Liquidity & Listing',
            is_active: false,
            stage_ends_at: new Date(now.getTime() + 30 * 24 * 3600 * 1000).toISOString(),
            current_price: 0.00006,
            bonus_pct: 10
         }
       ];
    }

    // Wyszukujemy aktualnie aktywny etap
    const currentStage = finalStages?.find(stage => stage.is_active) || null;

    return { usdRaised, allStages: finalStages, currentStage, error: null };

  } catch (error) {
    console.error('Błąd w getPresaleState:', error);
    // FALLBACK MOCK DATA ON ERROR
     const now = new Date();
    return {
      usdRaised: 8450,
      allStages: [
        {
          id: 1,
          name: 'Phase 1: Security Audit',
          is_active: true,
          stage_ends_at: new Date(now.getTime() + 10 * 24 * 3600 * 1000).toISOString(),
          current_price: 0.00004,
          bonus_pct: 25
        }
      ],
      currentStage: {
          id: 1,
          name: 'Phase 1: Security Audit',
          is_active: true,
          stage_ends_at: new Date(now.getTime() + 10 * 24 * 3600 * 1000).toISOString(),
          current_price: 0.00004,
          bonus_pct: 25
       },
      error: null,
    };
  }
}