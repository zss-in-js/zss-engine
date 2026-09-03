// Mapping hex codes to color names (organized by color groups)
export const hexToColorName: Record<string, string> = {
  // White variations
  '#fff': 'white',
  '#ffffff': 'white',

  // Black variations
  '#000': 'black',
  '#000000': 'black',

  // Red variations
  '#f00': 'red',
  '#ff0000': 'red',
  '#dc143c': 'crimson',
  '#b22222': 'firebrick',
  '#8b0000': 'darkred',
  '#cd5c5c': 'indianred',

  // Lime variations
  '#0f0': 'lime',
  '#00ff00': 'lime',

  // Blue variations
  '#00f': 'blue',
  '#0000ff': 'blue',
  '#000080': 'navy',
  '#00008b': 'darkblue',
  '#0000cd': 'mediumblue',
  '#191970': 'midnightblue',
  '#4169e1': 'royalblue',
  '#1e90ff': 'dodgerblue',
  '#6495ed': 'cornflowerblue',
  '#4682b4': 'steelblue',
  '#5f9ea0': 'cadetblue',
  '#87ceeb': 'skyblue',
  '#87cefa': 'lightskyblue',
  '#add8e6': 'lightblue',
  '#b0e0e6': 'powderblue',
  '#b0c4de': 'lightsteelblue',
  '#e6e6fa': 'lavender',

  // Yellow variations
  '#ff0': 'yellow',
  '#ffff00': 'yellow',
  '#ffd700': 'gold',
  '#daa520': 'goldenrod',
  '#b8860b': 'darkgoldenrod',
  '#eee8aa': 'palegoldenrod',
  '#fafad2': 'lightgoldenrodyellow',
  '#ffffe0': 'lightyellow',
  '#fffacd': 'lemonchiffon',
  '#f5deb3': 'wheat',
  '#ffe4b5': 'moccasin',
  '#ffdead': 'navajowhite',
  '#f0e68c': 'khaki',
  '#bdb76b': 'darkkhaki',

  // Aqua/Cyan variations
  '#0ff': 'aqua',
  '#00ffff': 'aqua',
  '#008b8b': 'darkcyan',
  '#20b2aa': 'lightseagreen',
  '#40e0d0': 'turquoise',
  '#48d1cc': 'mediumturquoise',
  '#00ced1': 'darkturquoise',
  '#afeeee': 'paleturquoise',
  '#e0ffff': 'lightcyan',
  '#f0ffff': 'azure',

  // Fuchsia/Magenta variations
  '#f0f': 'fuchsia',
  '#ff00ff': 'fuchsia',
  '#8b008b': 'darkmagenta',
  '#c71585': 'mediumvioletred',
  '#db7093': 'palevioletred',
  '#ff1493': 'deeppink',
  '#ff69b4': 'hotpink',
  '#ffb6c1': 'lightpink',
  '#ffc0cb': 'pink',

  // Silver variations
  '#c0c0c0': 'silver',

  // Gray variations
  '#808080': 'gray',
  '#a9a9a9': 'darkgray',
  '#696969': 'dimgray',
  '#2f4f4f': 'darkslategray',
  '#708090': 'slategray',
  '#778899': 'lightslategray',
  '#d3d3d3': 'lightgray',
  '#dcdcdc': 'gainsboro',
  '#f5f5f5': 'whitesmoke',

  // Maroon variations
  '#800000': 'maroon',

  // Olive variations
  '#808000': 'olive',
  '#556b2f': 'darkolivegreen',
  '#6b8e23': 'olivedrab',

  // Green variations
  '#008000': 'green',
  '#006400': 'darkgreen',
  '#228b22': 'forestgreen',
  '#32cd32': 'limegreen',
  '#90ee90': 'lightgreen',
  '#98fb98': 'palegreen',
  '#8fbc8f': 'darkseagreen',
  '#3cb371': 'mediumseagreen',
  '#2e8b57': 'seagreen',
  '#00ff7f': 'springgreen',
  '#adff2f': 'greenyellow',
  '#7cfc00': 'lawngreen',
  '#7fff00': 'chartreuse',
  '#9acd32': 'yellowgreen',

  // Purple variations
  '#800080': 'purple',
  '#663399': 'rebeccapurple',
  '#4b0082': 'indigo',
  '#483d8b': 'darkslateblue',
  '#6a5acd': 'slateblue',
  '#7b68ee': 'mediumslateblue',
  '#9370db': 'mediumpurple',
  '#8a2be2': 'blueviolet',
  '#9400d3': 'darkviolet',
  '#9932cc': 'darkorchid',
  '#ba55d3': 'mediumorchid',
  '#da70d6': 'orchid',
  '#ee82ee': 'violet',
  '#dda0dd': 'plum',
  '#d8bfd8': 'thistle',

  // Teal variations
  '#008080': 'teal',

  // Orange variations
  '#ffa500': 'orange',
  '#ff8c00': 'darkorange',
  '#ff4500': 'orangered',
  '#ff6347': 'tomato',
  '#ff7f50': 'coral',
  '#f08080': 'lightcoral',
  '#e9967a': 'darksalmon',
  '#ffa07a': 'lightsalmon',
  '#fa8072': 'salmon',
  '#cd853f': 'peru',
  '#d2691e': 'chocolate',
  '#a0522d': 'sienna',
  '#8b4513': 'saddlebrown',
  '#a52a2a': 'brown',
  '#bc8f8f': 'rosybrown',
  '#deb887': 'burlywood',
  '#f4a460': 'sandybrown',
  '#d2b48c': 'tan',

  // Beige/Cream variations
  '#f5f5dc': 'beige',
  '#faf0e6': 'linen',
  '#faebd7': 'antiquewhite',
  '#ffebcd': 'blanchedalmond',
  '#ffe4c4': 'bisque',
  '#ffefd5': 'papayawhip',
  '#fff8dc': 'cornsilk',
  '#f0fff0': 'honeydew',
  '#fffff0': 'ivory',
  '#fffaf0': 'floralwhite',
  '#fff5ee': 'seashell',
  '#fdf5e6': 'oldlace',
  '#fffafa': 'snow',
  '#f8f8ff': 'ghostwhite',
  '#f0f8ff': 'aliceblue',
  '#f5fffa': 'mintcream',
  '#ffe4e1': 'mistyrose',
  '#fff0f5': 'lavenderblush',
  '#ffdab9': 'peachpuff',
  '#66cdaa': 'mediumaquamarine',
  '#7fffd4': 'aquamarine',
  '#00fa9a': 'mediumspringgreen',
  '#00bfff': 'deepskyblue',
};
