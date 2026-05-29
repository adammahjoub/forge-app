export const WORKOUT_TEMPLATES = [
  {
    id: 'upper_a',
    name: 'UPPER A',
    tag: 'PUSH FOCUS · SESSION 1',
    focus: 'Chest / Shoulders / Triceps',
    exercises: [
      { name: 'Flat Barbell Bench Press', muscle: 'CHEST',        defaultReps: '8',  defaultWeight: '60' },
      { name: 'Overhead Press',           muscle: 'SHOULDERS',    defaultReps: '8',  defaultWeight: '40' },
      { name: 'Incline DB Press',         muscle: 'UPPER CHEST',  defaultReps: '10', defaultWeight: '22' },
      { name: 'Tricep Pushdown',          muscle: 'TRICEPS',      defaultReps: '12', defaultWeight: '30' },
      { name: 'Lateral Raises',           muscle: 'SIDE DELTS',   defaultReps: '15', defaultWeight: '10' },
    ],
  },
  {
    id: 'lower',
    name: 'LOWER',
    tag: 'QUAD + POSTERIOR CHAIN · SESSION 2',
    focus: 'Quads / Hamstrings / Glutes',
    exercises: [
      { name: 'Barbell Back Squat',    muscle: 'QUADS',      defaultReps: '6',  defaultWeight: '80'  },
      { name: 'Romanian Deadlift',     muscle: 'HAMSTRINGS', defaultReps: '8',  defaultWeight: '70'  },
      { name: 'Leg Press',             muscle: 'QUADS',      defaultReps: '12', defaultWeight: '120' },
      { name: 'Leg Curl',              muscle: 'HAMSTRINGS', defaultReps: '12', defaultWeight: '40'  },
      { name: 'Standing Calf Raise',   muscle: 'CALVES',     defaultReps: '15', defaultWeight: '60'  },
    ],
  },
  {
    id: 'pull',
    name: 'PULL',
    tag: 'BACK + BICEPS · SESSION 3',
    focus: 'Lats / Mid Back / Biceps',
    exercises: [
      { name: 'Conventional Deadlift',  muscle: 'POSTERIOR', defaultReps: '5',  defaultWeight: '100' },
      { name: 'Pull-ups',               muscle: 'LATS',      defaultReps: '6',  defaultWeight: 'BW'  },
      { name: 'Barbell Row',            muscle: 'MID BACK',  defaultReps: '8',  defaultWeight: '60'  },
      { name: 'Face Pulls',             muscle: 'REAR DELTS',defaultReps: '15', defaultWeight: '25'  },
      { name: 'Barbell Bicep Curl',     muscle: 'BICEPS',    defaultReps: '10', defaultWeight: '30'  },
    ],
  },
  {
    id: 'upper_b',
    name: 'UPPER B',
    tag: 'PULL FOCUS · SESSION 4',
    focus: 'Back / Shoulders / Arms',
    exercises: [
      { name: 'Weighted Pull-ups',          muscle: 'LATS',      defaultReps: '6',  defaultWeight: '+5'  },
      { name: 'DB Shoulder Press',          muscle: 'SHOULDERS', defaultReps: '10', defaultWeight: '20'  },
      { name: 'Cable Row',                  muscle: 'MID BACK',  defaultReps: '10', defaultWeight: '50'  },
      { name: 'Rear Delt Fly',              muscle: 'REAR DELTS',defaultReps: '15', defaultWeight: '10'  },
      { name: 'Overhead Tricep Extension',  muscle: 'TRICEPS',   defaultReps: '12', defaultWeight: '25'  },
    ],
  },
]
