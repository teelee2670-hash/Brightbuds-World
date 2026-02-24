export const STICKERS: Record<string, Array<{ id: string; name: string; emoji: string }>> = {
  world1: [
    { id: 'stk_d1', name: 'Baby Rex', emoji: '🦖' }, { id: 'stk_d2', name: 'Triceratops', emoji: '🦕' },
    { id: 'stk_d3', name: 'Egg', emoji: '🥚' }, { id: 'stk_d4', name: 'Volcano', emoji: '🌋' },
    { id: 'stk_d5', name: 'Fern', emoji: '🌿' }, { id: 'stk_d6', name: 'Bone', emoji: '🦴' },
    { id: 'stk_d7', name: 'Footprint', emoji: '🐾' }, { id: 'stk_d8', name: 'Palm', emoji: '🌴' },
    { id: 'stk_d9', name: 'Meteor', emoji: '☄️' }, { id: 'stk_d10', name: 'Leaf', emoji: '🍃' },
  ],
  world2: [
    { id: 'stk_s1', name: 'Rocket', emoji: '🚀' }, { id: 'stk_s2', name: 'Planet', emoji: '🪐' },
    { id: 'stk_s3', name: 'Star', emoji: '⭐' }, { id: 'stk_s4', name: 'Moon', emoji: '🌙' },
    { id: 'stk_s5', name: 'Alien', emoji: '👽' }, { id: 'stk_s6', name: 'Satellite', emoji: '🛰️' },
    { id: 'stk_s7', name: 'Comet', emoji: '☄️' }, { id: 'stk_s8', name: 'Telescope', emoji: '🔭' },
    { id: 'stk_s9', name: 'Sun', emoji: '☀️' }, { id: 'stk_s10', name: 'UFO', emoji: '🛸' },
  ],
  world3: [
    { id: 'stk_c1', name: 'Puppy', emoji: '🐶' }, { id: 'stk_c2', name: 'Kitten', emoji: '🐱' },
    { id: 'stk_c3', name: 'Bunny', emoji: '🐰' }, { id: 'stk_c4', name: 'Fox', emoji: '🦊' },
    { id: 'stk_c5', name: 'Panda', emoji: '🐼' }, { id: 'stk_c6', name: 'Hamster', emoji: '🐹' },
    { id: 'stk_c7', name: 'Bear', emoji: '🧸' }, { id: 'stk_c8', name: 'Owl', emoji: '🦉' },
    { id: 'stk_c9', name: 'Penguin', emoji: '🐧' }, { id: 'stk_c10', name: 'Butterfly', emoji: '🦋' },
  ],
};

export const DECOR = {
  wallpapers: [
    { id: 'wall_default', name: 'Sunny Day', emoji: '☀️', color: '#FFF9F0', premium: false },
    { id: 'wall_meadow', name: 'Green Meadow', emoji: '🌿', color: '#E8F5E9', premium: false },
    { id: 'wall_ocean', name: 'Ocean Blue', emoji: '🌊', color: '#E3F2FD', premium: false },
    { id: 'wall_galaxy', name: 'Galaxy Night', emoji: '🌌', color: '#1A237E', premium: true },
    { id: 'wall_sunset', name: 'Sunset Pink', emoji: '🌅', color: '#FCE4EC', premium: true },
    { id: 'wall_rainbow', name: 'Rainbow', emoji: '🌈', color: '#F3E5F5', premium: true },
  ],
  rugs: [
    { id: 'rug_default', name: 'Cozy Rug', emoji: '🟫', color: '#D7CCC8', premium: false },
    { id: 'rug_green', name: 'Grass Rug', emoji: '🟩', color: '#A5D6A7', premium: false },
    { id: 'rug_star', name: 'Star Rug', emoji: '⭐', color: '#FFF176', premium: true },
    { id: 'rug_cloud', name: 'Cloud Rug', emoji: '☁️', color: '#BBDEFB', premium: true },
  ],
  posters: [
    { id: 'poster_default', name: 'ABC Poster', emoji: '📝', color: '#FFF9C4', premium: false },
    { id: 'poster_dino', name: 'Dino Poster', emoji: '🦕', color: '#C8E6C9', premium: false },
    { id: 'poster_space', name: 'Space Poster', emoji: '🚀', color: '#BBDEFB', premium: true },
    { id: 'poster_animals', name: 'Animals', emoji: '🐾', color: '#F8BBD0', premium: true },
  ],
};
