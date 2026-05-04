// Nivåprofiler – startpunkt til soner erstattes av testresultater
// Nivå tildeles i athletes.js og overstyres automatisk av Løpetest 20 min

const TRAINING_LEVELS = {
  A: {
    label: 'Nivå A',
    description: 'Sterk løper / OCR-erfaren',
    easy_run_kmh:  9.5,
    ocr_run_kmh:  10.5,
    threshold_kmh: 11.5,
    strides_kmh:   14.0,
    hang_sec:      90,
    carry_kg:      30,
  },
  B: {
    label: 'Nivå B',
    description: 'Middels løper / OCR-moderat',
    easy_run_kmh:  7.0,
    ocr_run_kmh:   8.0,
    threshold_kmh: 8.5,
    strides_kmh:   11.0,
    hang_sec:      60,
    carry_kg:      20,
  },
  C: {
    label: 'Nivå C',
    description: 'Nybegynner / moderat løper',
    easy_run_kmh:  6.0,
    ocr_run_kmh:   6.8,
    threshold_kmh: 7.5,
    strides_kmh:   9.5,
    hang_sec:      45,
    carry_kg:      15,
  },
};
