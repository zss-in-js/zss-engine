import type { CSSVariableValue, CSSVariableProperty } from '../main/vars';
import type { Properties, Property } from 'csstype';

type ColorValue = Exclude<Property.Color, '-moz-initial'> | (string & {});
type CSSColorProperty = Exclude<ColorValue, SystemColorKeyword>;

type SystemColorKeyword =
  | 'ActiveBorder'
  | 'ActiveCaption'
  | 'AppWorkspace'
  | 'Background'
  | 'ButtonFace'
  | 'ButtonHighlight'
  | 'ButtonShadow'
  | 'ButtonText'
  | 'CaptionText'
  | 'GrayText'
  | 'Highlight'
  | 'HighlightText'
  | 'InactiveBorder'
  | 'InactiveCaption'
  | 'InactiveCaptionText'
  | 'InfoBackground'
  | 'InfoText'
  | 'Menu'
  | 'MenuText'
  | 'Scrollbar'
  | 'ThreeDDarkShadow'
  | 'ThreeDFace'
  | 'ThreeDHighlight'
  | 'ThreeDLightShadow'
  | 'ThreeDShadow'
  | 'Window'
  | 'WindowFrame'
  | 'WindowText';

type ExcludeMozInitial<T> = Exclude<T, '-moz-initial'>;

type CSSTypeProperties = Properties<number | (string & {})>;

type CustomProperties = {
  [K in keyof CSSTypeProperties]: ExcludeMozInitial<CSSTypeProperties[K]>;
};

type BaseCSSProperties = {
  [K in keyof CustomProperties]: CustomProperties[K] | CSSVariableValue;
};

interface CommonProperties extends BaseCSSProperties {
  accentColor?: CSSColorProperty;
  color?: CSSColorProperty;
  borderLeftColor?: CSSColorProperty;
  borderRightColor?: CSSColorProperty;
  borderTopColor?: CSSColorProperty;
  borderBottomColor?: CSSColorProperty;
  borderBlockColor?: CSSColorProperty;
  borderBlockStartColor?: CSSColorProperty;
  borderBlockEndColor?: CSSColorProperty;
  borderInlineColor?: CSSColorProperty;
  borderInlineStartColor?: CSSColorProperty;
  borderInlineEndColor?: CSSColorProperty;
  backgroundColor?: CSSColorProperty;
  outlineColor?: CSSColorProperty;
  textDecorationColor?: CSSColorProperty;
  caretColor?: CSSColorProperty;
  columnRuleColor?: CSSColorProperty;
}

type AndString = `&${string}`;
type AndStringType = {
  [key in AndString]: CommonProperties;
};

type Colon = `:${string}`;
type ColonType = {
  [key in Colon]: CommonProperties;
};

export type MediaQuery = `@media ${string}`;
type MediaQueryType = {
  [K in MediaQuery]: CommonProperties | ColonType | AndStringType;
};

export type CSSProperties = CommonProperties | ColonType | CSSVariableProperty | AndStringType | MediaQueryType;
