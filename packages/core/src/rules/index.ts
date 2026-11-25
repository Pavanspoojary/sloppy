export interface RuleGuide {
  title: string;
  commandment: string;
  rules: { name: string; description: string; rule: string }[];
  failureModes: string[];
  remediation: string;
}

export const CRAFT_RULES: RuleGuide = {
  title: 'Craft & Restraint',
  commandment: 'It reads as a real product, simplified to what the viewer needs, framed with intent.',
  rules: [
    {
      name: 'Word Budget',
      description: 'Budget for words, not elements.',
      rule: 'Count real strings: usually 3 to 7. Use real words only on what the story is about. Use placeholder lines (<Bar />) for the rest. Filling every row with fake numbers and text makes it look generated.'
    },
    {
      name: 'Surface Depth',
      description: 'Hierarchy through subtle surface steps, not uniform borders.',
      rule: 'Step from ground to surface 1, surface 2, surface 3 using quiet grays or true dark steps. Reserve the accent color for one intentional signal.'
    },
    {
      name: 'Authentic Chrome',
      description: 'Real product chrome instead of generic wireframes.',
      rule: 'Draw real window headers, accurate traffic lights, genuine tab bars, or realistic phone bezels. Avoid generic gray rounded boxes.'
    },
    {
      name: 'No Stock AI Tropes',
      description: 'Zero purple gradients, zero sparkles.',
      rule: 'Never use purple/indigo gradients, magic wands, sparkles, or "Powered by AI" pills. High-craft tools speak through clean utility.'
    }
  ],
  failureModes: [
    'Too much: Real text in every row, numbers everywhere.',
    'Wireframe: Two gray blobs and a button.',
    'Flat: Every object has the same weight in the same bordered card.',
    'Bland: A gray window with a cursor, whatever the brief said.'
  ],
  remediation: 'Simplify the words, not the context. Quiet grays, real words only on what matters, subtle surface depth, and intentional accent color.'
};

export const FRAMING_RULES: RuleGuide = {
  title: 'Framing & Cropping',
  commandment: 'Crop to where the story happens; non-focal filler bleeds off edges.',
  rules: [
    {
      name: 'Two-Thirds Coverage',
      description: 'A window or phone must command its stage.',
      rule: 'The window or phone fills at least two-thirds of the stage and runs off at least one edge. Never float a shrunken window with air on all four sides.'
    },
    {
      name: 'Bleeding Filler',
      description: 'Only filler bleeds; what opens stays in.',
      rule: 'Lists and table rows run off the bottom or sides to imply continuity. Popups, menus, tooltips, and action payoffs must stay fully visible inside the frame.'
    },
    {
      name: 'One Gutter or Well Past',
      description: 'Intentional margin discipline.',
      rule: 'Keep either exactly one gutter width (e.g. 16px/24px) or run well past the frame. Avoid accidental 1-3px slivers or tangent collisions.'
    },
    {
      name: 'The Page is the Ground',
      description: 'No plate under a hero on white or dark pages.',
      rule: 'If the landing page is dark, the stage ground is dark. Do not put an unnecessary tinted plate behind an already framed window.'
    }
  ],
  failureModes: [
    'Boxed: A whole window shrunk into a card with uniform padding on all 4 sides.',
    'Dead corners: Large empty areas in an illustration.',
    'Clipped popups: Modals or menus cut off by stage overflow.'
  ],
  remediation: 'Crop aggressively to the panel containing the action. Let background grids and rows bleed into the distance.'
};

export const MOTION_RULES: RuleGuide = {
  title: 'Motion & Choreography',
  commandment: 'Every motion has a visible cause, and the payoff holds.',
  rules: [
    {
      name: 'Cause and Effect',
      description: 'No unearned motion.',
      rule: 'A cursor moves with purpose, clicks with visible press feedback, and triggers a state transition. Never add arbitrary looping spins, bounces, or pulses.'
    },
    {
      name: 'Content Moves, Never Swaps',
      description: 'Continuity of visual elements.',
      rule: 'When values or text change, roll or crossfade smoothly. Do not jump-swap content without a transition.'
    },
    {
      name: 'Overlapping Beats',
      description: 'Staggered natural timing.',
      rule: 'Incoming elements overlap by 50-100ms rather than waiting sequentially. The main payoff holds on screen for 2-3 seconds for comfortable reading time.'
    },
    {
      name: 'Clean Loop Seam',
      description: 'Seamless or cause-driven resets.',
      rule: 'Animations either loop naturally back to origin or reset with an explicit cause (e.g. closing a drawer, navigating back).'
    },
    {
      name: 'Reduced Motion & GPU Discipline',
      description: 'Respect prefers-reduced-motion and animate compositor properties only.',
      rule: 'With Motion/Anime/React Spring/Tween, guard with useReducedMotion() or prefers-reduced-motion, avoid repeat: Infinity on static cards, and animate transform/opacity instead of width/height/top/left.'
    },
    {
      name: 'Scroll, WebGL & Lottie Lifecycle Hygiene',
      description: 'Clean disposal, on-demand frames, and non-hijacking scroll.',
      rule: 'Lenis/AOS/Rellax/Lax/Atropos must never break native scroll or hide hero content; Three.js/R3F/PixiJS must bound DPR, use frameloop="demand" where idle, and dispose on unmount; Lottie/dotLottie/Rive must tie playback to state and clean up instances.'
    }
  ],
  failureModes: [
    'Unearned animation: Cards bouncing on load with no user trigger.',
    'Swapping text without motion: Numbers jumping jarringly in place.',
    'Rush to reset: Resetting immediately after payoff before the human can read the result.'
  ],
  remediation: 'Choreograph using the Act API: precise beats, measured rects, easing curves, and a lingering payoff.'
};

export const BENTO_RULES: RuleGuide = {
  title: 'Bento Grid Architecture',
  commandment: 'One hero tile commands attention; neighboring tiles support with varied scale.',
  rules: [
    {
      name: 'Clear Focal Lead',
      description: 'One tile must dominate.',
      rule: 'In any bento grid, one tile is the hero (spanning 2 columns or larger). The eye must land instantly on the focal tile.'
    },
    {
      name: 'Varied Tile Types',
      description: 'Diversity of form across cells.',
      rule: 'Combine: 1 active hero window/demo + 1 metric stat + 1 satellite object/device + 1 structural diagram. Never make 4 identical cards with text and an icon.'
    },
    {
      name: 'Opposite Corner Anchors',
      description: 'Diagonal balance.',
      rule: 'Place descriptive typography in one corner (e.g. bottom-left) and the product artifact bleeding from the opposite corner (e.g. top-right).'
    }
  ],
  failureModes: [
    'Monotonous grid: 4 identical cards with an icon, title, and paragraph.',
    'No hierarchy: All cells the exact same size with identical weights.'
  ],
  remediation: 'Establish a dominant 2x2 or 2x1 hero tile, vary cell structures (still, metric, flow), and anchor diagonally.'
};

export function getRulesByTopic(topic: string): RuleGuide {
  switch (topic.toLowerCase()) {
    case 'craft':
    case 'restraint':
    case 'word_budget':
      return CRAFT_RULES;
    case 'framing':
    case 'crop':
      return FRAMING_RULES;
    case 'motion':
    case 'choreography':
      return MOTION_RULES;
    case 'bento':
    case 'grid':
      return BENTO_RULES;
    default:
      return CRAFT_RULES;
  }
}
