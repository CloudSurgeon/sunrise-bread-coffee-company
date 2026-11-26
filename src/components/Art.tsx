import React from 'react';
import { SYRUPS } from '../data/menuAndDays';
import type { BakeryKind, CustomerArchetype, MenuItem, SyrupFlavor } from '../types/game';

interface BreakfastCupArtProps {
  hasSausage: boolean;
  hasEgg: boolean;
  hasGravy: boolean;
  cheddar: boolean;
  biscuit: boolean;
  size?: number;
}

export const BreakfastCupArt: React.FC<BreakfastCupArtProps> = ({
  hasSausage,
  hasEgg,
  hasGravy,
  cheddar,
  biscuit,
  size = 64,
}) => {
  const isHot = hasSausage || hasEgg || hasGravy;
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden="true">
      {/* Steam wisps when warm */}
      {isHot && (
        <g opacity="0.72" className="svg-steam">
          <path d="M27 15 C25 10, 30 7, 28 3" stroke="#FFF9EE" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M40 13 C38 8, 43 5, 41 1" stroke="#FFF9EE" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M53 15 C51 10, 56 7, 54 3" stroke="#FFF9EE" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {/* Back rim of cup */}
      <ellipse cx="40" cy="29" rx="23" ry="8" fill="#D5A679" stroke="#4B2E1E" strokeWidth="2.5" />

      {/* Layer 1: Cooked Sausage crumbles */}
      {hasSausage && (
        <g>
          <ellipse cx="30" cy="29" rx="7" ry="4.5" fill="#7D3B23" stroke="#4B2E1E" strokeWidth="1.8" />
          <ellipse cx="42" cy="30" rx="8" ry="5" fill="#8E462A" stroke="#4B2E1E" strokeWidth="1.8" />
          <ellipse cx="52" cy="28" rx="6.5" ry="4.2" fill="#74341E" stroke="#4B2E1E" strokeWidth="1.8" />
          <circle cx="38" cy="27" r="2" fill="#A95C3A" />
        </g>
      )}

      {/* Layer 2: Fluffy Scrambled Eggs */}
      {hasEgg && (
        <g>
          <path
            d="M21 28 C22 20, 32 18, 37 22 C41 17, 52 18, 56 23 C61 24, 60 31, 52 32 C43 34, 28 34, 21 28 Z"
            fill="#FFD447"
            stroke="#4B2E1E"
            strokeWidth="2"
          />
          <path d="M29 25 Q35 21 41 25" stroke="#FFF3B0" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M44 24 Q49 21 53 25" stroke="#F4B41A" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {/* Layer 3: Country Peppered Gravy */}
      {hasGravy && (
        <g>
          <path
            d="M20 27 C23 21, 35 20, 41 22 C49 20, 58 22, 60 28 C58 32, 54 36, 51 33 C48 30, 44 37, 40 34 C36 31, 32 37, 29 33 C26 30, 21 32, 20 27 Z"
            fill="#F4EAD5"
            stroke="#4B2E1E"
            strokeWidth="2"
          />
          {/* Black pepper & herb speckles */}
          <circle cx="29" cy="27" r="1.3" fill="#4B2E1E" />
          <circle cx="37" cy="25" r="1.4" fill="#4B2E1E" />
          <circle cx="46" cy="27" r="1.3" fill="#4B2E1E" />
          <circle cx="52" cy="25" r="1.2" fill="#4B2E1E" />
          <circle cx="41" cy="30" r="1.2" fill="#6B4C35" />
          <circle cx="33" cy="29" r="1.1" fill="#6B4C35" />
        </g>
      )}

      {/* Optional Add-On: Shredded Cheddar */}
      {cheddar && (
        <g>
          <path d="M27 24 L34 21" stroke="#FF8C1A" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M36 22 L44 24" stroke="#FFA31A" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M45 21 L53 24" stroke="#FF7A00" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M33 27 L41 25" stroke="#FFB326" strokeWidth="2.8" strokeLinecap="round" />
        </g>
      )}

      {/* Optional Add-On: Buttermilk Biscuit Crumbles */}
      {biscuit && (
        <g>
          <path
            d="M32 19 C32 13, 47 13, 48 19 C49 23, 31 23, 32 19 Z"
            fill="#F0C173"
            stroke="#4B2E1E"
            strokeWidth="2"
          />
          <path d="M35 17 Q40 14 45 17" stroke="#FFE5B4" strokeWidth="2" strokeLinecap="round" />
          <circle cx="51" cy="20" r="3.2" fill="#E6B260" stroke="#4B2E1E" strokeWidth="1.6" />
          <circle cx="28" cy="21" r="2.8" fill="#E6B260" stroke="#4B2E1E" strokeWidth="1.6" />
        </g>
      )}

      {/* Cup Body */}
      <path
        d="M17 30 L24 68 C25 72, 55 72, 56 68 L63 30 C55 35, 25 35, 17 30 Z"
        fill="#FFF3DF"
        stroke="#4B2E1E"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      {/* Warm Kraft Band */}
      <path
        d="M20 43 C31 47, 49 47, 60 43 L58 58 C48 61, 32 61, 22 58 Z"
        fill="#E5A25D"
        stroke="#4B2E1E"
        strokeWidth="2"
      />
      {/* Sunrise emblem on cup */}
      <path d="M33 54 A7 7 0 0 1 47 54 Z" fill="#FF7A45" stroke="#4B2E1E" strokeWidth="1.6" />
      <line x1="30" y1="54" x2="50" y2="54" stroke="#4B2E1E" strokeWidth="1.8" strokeLinecap="round" />
      {/* Mini cutaway layer dots on lower rim for instant readability */}
      <g transform="translate(26, 63)">
        <circle cx="5" cy="0" r="3" fill={hasSausage ? '#8E462A' : '#E8DAC6'} stroke="#4B2E1E" strokeWidth="1.2" />
        <circle cx="14" cy="0" r="3" fill={hasEgg ? '#FFD447' : '#E8DAC6'} stroke="#4B2E1E" strokeWidth="1.2" />
        <circle cx="23" cy="0" r="3" fill={hasGravy ? '#F7EFE0' : '#E8DAC6'} stroke="#4B2E1E" strokeWidth="1.2" />
      </g>
    </svg>
  );
};

interface CoffeeCupArtProps {
  iced: boolean;
  syrup: SyrupFlavor;
  coldFoam: boolean;
  size?: number;
}

export const CoffeeCupArt: React.FC<CoffeeCupArtProps> = ({
  iced,
  syrup,
  coldFoam,
  size = 64,
}) => {
  const meta = SYRUPS[syrup];

  if (iced) {
    return (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden="true">
        {/* Straw */}
        <path d="M46 22 L53 4" stroke="#2CB5A0" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M46 22 L53 4" stroke="#4B2E1E" strokeWidth="1.4" strokeLinecap="round" opacity="0.35" />

        {/* Clear Cup Body */}
        <path
          d="M21 24 L27 69 C28 73, 52 73, 53 69 L59 24 Z"
          fill="#E8F7FA"
          stroke="#4B2E1E"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Coffee Liquid */}
        <path
          d="M23 32 L28 67 C29 70, 51 70, 52 67 L57 32 Z"
          fill={meta.liquidColor}
        />
        {/* Flavor Swirl */}
        {syrup !== 'plain' && (
          <path
            d="M27 50 Q38 42 46 53 T54 45"
            stroke={meta.accentColor}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.88"
          />
        )}
        {/* Ice Cubes */}
        <rect x="27" y="34" width="10" height="10" rx="2.5" fill="#DDF8FF" opacity="0.82" stroke="#7BC7D6" strokeWidth="1.4" transform="rotate(-10 32 39)" />
        <rect x="42" y="35" width="10" height="10" rx="2.5" fill="#DDF8FF" opacity="0.82" stroke="#7BC7D6" strokeWidth="1.4" transform="rotate(12 47 40)" />
        <rect x="35" y="45" width="9" height="9" rx="2" fill="#DDF8FF" opacity="0.65" stroke="#7BC7D6" strokeWidth="1.2" transform="rotate(6 39 49)" />

        {/* Cold Foam Layer */}
        {coldFoam && (
          <path
            d="M22 33 C22 25, 31 24, 35 27 C39 22, 50 23, 53 27 C57 26, 59 31, 57 34 C48 36, 30 36, 22 33 Z"
            fill="#FFFDF8"
            stroke="#4B2E1E"
            strokeWidth="2"
          />
        )}
        {/* Dome Lid */}
        <path
          d="M19 25 C21 15, 59 15, 61 25 Z"
          fill="#FFFFFF"
          fillOpacity="0.45"
          stroke="#4B2E1E"
          strokeWidth="2.2"
        />
        <rect x="18" y="23" width="44" height="5" rx="2.5" fill="#FFFDF8" stroke="#4B2E1E" strokeWidth="2.2" />
        {/* Flavor tag */}
        {syrup !== 'plain' && (
          <circle cx="40" cy="57" r="6" fill={meta.bottleColor} stroke="#4B2E1E" strokeWidth="1.8" />
        )}
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden="true">
      {/* Steam */}
      <g opacity="0.72" className="svg-steam">
        <path d="M31 15 C29 10, 34 7, 32 3" stroke="#FFF9EE" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M46 14 C44 9, 49 6, 47 2" stroke="#FFF9EE" strokeWidth="2.4" strokeLinecap="round" />
      </g>

      {/* Hot Cup Body */}
      <path
        d="M21 26 L27 69 C28 73, 52 73, 53 69 L59 26 Z"
        fill="#FFF7EB"
        stroke="#4B2E1E"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Coffee Sleeve colored by flavor */}
      <path
        d="M23 41 L57 41 L55 58 L25 58 Z"
        fill={syrup === 'plain' ? '#D49A6A' : meta.bottleColor}
        stroke="#4B2E1E"
        strokeWidth="2.2"
      />
      {/* Sunrise Bean Emblem */}
      <circle cx="40" cy="49.5" r="6.2" fill="#FFF8EE" stroke="#4B2E1E" strokeWidth="1.6" />
      <ellipse cx="40" cy="49.5" rx="3.2" ry="4.2" fill={meta.liquidColor} transform="rotate(-18 40 49.5)" />

      {/* Liquid / Foam Top */}
      {coldFoam ? (
        <path
          d="M22 26 C22 17, 32 16, 37 19 C41 13, 52 15, 55 20 C59 21, 59 27, 56 28 L24 28 Z"
          fill="#FFFDF8"
          stroke="#4B2E1E"
          strokeWidth="2.2"
        />
      ) : (
        <ellipse cx="40" cy="26" rx="18" ry="5" fill={meta.liquidColor} stroke="#4B2E1E" strokeWidth="2" />
      )}
      {/* Cup Rim */}
      <rect x="18" y="23" width="44" height="5.5" rx="2.7" fill="#FFFDF8" stroke="#4B2E1E" strokeWidth="2.3" />
    </svg>
  );
};

interface BakeryItemArtProps {
  pastry: BakeryKind;
  size?: number;
  burnt?: boolean;
}

export const BakeryItemArt: React.FC<BakeryItemArtProps> = ({ pastry, size = 60, burnt = false }) => {
  const filter = burnt ? 'brightness(0.35) saturate(0.2)' : undefined;

  if (pastry === 'cinnamon_roll') {
    return (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none" style={{ filter }} aria-hidden="true">
        <ellipse cx="40" cy="48" rx="27" ry="19" fill="#C97C3B" stroke="#4B2E1E" strokeWidth="2.6" />
        <ellipse cx="40" cy="41" rx="24" ry="15" fill="#E5A25D" stroke="#4B2E1E" strokeWidth="2.4" />
        {/* Cinnamon swirl */}
        <path
          d="M40 41 C43 38, 48 41, 46 45 C43 49, 32 49, 30 42 C28 34, 42 30, 50 35 C56 39, 55 49, 44 52"
          stroke="#7A3B1E"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Vanilla icing drizzle */}
        <path
          d="M23 39 Q32 32 41 37 T57 39 Q53 45 45 43 T28 45 Z"
          fill="#FFFDF7"
          opacity="0.92"
          stroke="#E8D8C3"
          strokeWidth="1.2"
        />
      </svg>
    );
  }

  if (pastry === 'blueberry_muffin') {
    return (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none" style={{ filter }} aria-hidden="true">
        {/* Paper liner */}
        <path d="M22 44 L27 67 H53 L58 44 Z" fill="#F2D7B6" stroke="#4B2E1E" strokeWidth="2.5" strokeLinejoin="round" />
        <line x1="32" y1="45" x2="34" y2="66" stroke="#C9A27C" strokeWidth="2" />
        <line x1="40" y1="45" x2="40" y2="66" stroke="#C9A27C" strokeWidth="2" />
        <line x1="48" y1="45" x2="46" y2="66" stroke="#C9A27C" strokeWidth="2" />
        {/* Golden dome */}
        <path
          d="M17 45 C16 25, 29 17, 40 17 C51 17, 64 25, 63 45 C56 49, 24 49, 17 45 Z"
          fill="#E9B262"
          stroke="#4B2E1E"
          strokeWidth="2.6"
        />
        {/* Blueberries */}
        <circle cx="30" cy="34" r="4.2" fill="#4654B8" stroke="#282E6B" strokeWidth="1.5" />
        <circle cx="43" cy="27" r="4.5" fill="#3B48A8" stroke="#282E6B" strokeWidth="1.5" />
        <circle cx="51" cy="36" r="4" fill="#4E5DC4" stroke="#282E6B" strokeWidth="1.5" />
        <circle cx="37" cy="40" r="3.6" fill="#4654B8" stroke="#282E6B" strokeWidth="1.5" />
        <circle cx="29" cy="33" r="1.2" fill="#9BB0FF" />
        <circle cx="42" cy="26" r="1.2" fill="#9BB0FF" />
      </svg>
    );
  }

  if (pastry === 'cheddar_bread') {
    return (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none" style={{ filter }} aria-hidden="true">
        {/* Thick Artisan Cheddar Bread Slice */}
        <path
          d="M19 36 C16 23, 28 17, 40 17 C52 17, 64 23, 61 36 L58 65 C58 68, 22 68, 22 65 Z"
          fill="#C97932"
          stroke="#4B2E1E"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        <path
          d="M24 36 C22 27, 30 22, 40 22 C50 22, 58 27, 56 36 L54 61 H26 Z"
          fill="#FFE4A8"
        />
        {/* Melted Cheddar Pockets */}
        <path d="M29 31 Q37 26 44 32 Q38 38 29 35 Z" fill="#FF981A" stroke="#C96408" strokeWidth="1.4" />
        <path d="M43 44 Q51 40 52 48 Q45 52 41 47 Z" fill="#FFA81A" stroke="#C96408" strokeWidth="1.4" />
        <path d="M29 48 Q35 45 38 52 Q32 56 28 52 Z" fill="#FF8C00" stroke="#C96408" strokeWidth="1.4" />
        <circle cx="48" cy="34" r="3" fill="#FF981A" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" style={{ filter }} aria-hidden="true">
      {/* Flaky Butter Croissant */}
      <path
        d="M14 50 C16 32, 30 22, 40 22 C50 22, 64 32, 66 50 C67 57, 57 60, 52 53 C47 47, 33 47, 28 53 C23 60, 13 57, 14 50 Z"
        fill="#EEA542"
        stroke="#4B2E1E"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path d="M28 28 Q31 40 27 49" stroke="#9C571B" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M52 28 Q49 40 53 49" stroke="#9C571B" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M37 23 Q40 35 40 46" stroke="#C27424" strokeWidth="2" strokeLinecap="round" />
      <path d="M31 28 Q40 24 49 28" stroke="#FFE2A3" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
};

export const OrderItemArt: React.FC<{ item: MenuItem; size?: number }> = ({ item, size = 44 }) => {
  if (item.kind === 'breakfast_cup') {
    return (
      <BreakfastCupArt
        hasSausage={item.hasSausage}
        hasEgg={item.hasEgg}
        hasGravy={item.hasGravy}
        cheddar={item.cheddar}
        biscuit={item.biscuit}
        size={size}
      />
    );
  }
  if (item.kind === 'coffee') {
    return <CoffeeCupArt iced={item.iced} syrup={item.syrup} coldFoam={item.coldFoam} size={size} />;
  }
  return <BakeryItemArt pastry={item.pastry} size={size} />;
};

interface CustomerAvatarProps {
  archetype: CustomerArchetype;
  variant: number;
  mood: 'happy' | 'waiting' | 'impatient' | 'leaving' | 'served';
}

const SKIN_TONES = ['#F7C9A6', '#E5A87C', '#B9784E', '#8D5524', '#F3D2BA'];
const HAIR_COLORS = ['#3A2418', '#6B3E26', '#D49A45', '#1F1E24', '#A64B2A'];

export const CustomerAvatar: React.FC<CustomerAvatarProps> = ({ archetype, variant, mood }) => {
  const skin = SKIN_TONES[variant % SKIN_TONES.length];
  const hair = HAIR_COLORS[(variant * 2 + 1) % HAIR_COLORS.length];

  const shirtColor =
    archetype === 'engineer'
      ? '#2A62B6'
      : archetype === 'surfer'
        ? '#2CB5A0'
        : archetype === 'commuter'
          ? '#4D5B70'
          : '#FF7A45';

  return (
    <svg width="92" height="96" viewBox="0 0 92 96" fill="none" className={`customer-svg mood-${mood}`} aria-hidden="true">
      {/* Shoulders / Torso */}
      <path
        d="M14 96 C15 72, 27 65, 46 65 C65 65, 77 72, 78 96 Z"
        fill={shirtColor}
        stroke="#3D2416"
        strokeWidth="2.8"
      />

      {/* Archetype shirt details */}
      {archetype === 'engineer' && (
        <g>
          {/* KSC Lanyard & Rocket Badge */}
          <path d="M36 66 L46 84 L56 66" stroke="#FFD166" strokeWidth="3.2" fill="none" />
          <rect x="40" y="81" width="12" height="13" rx="2.5" fill="#FFFDF8" stroke="#3D2416" strokeWidth="1.8" />
          <circle cx="46" cy="87" r="3" fill="#E84C3D" />
        </g>
      )}
      {archetype === 'surfer' && (
        <g>
          {/* Wave stripe & puka necklace */}
          <path d="M22 84 Q34 78 46 84 T70 84" stroke="#FFD166" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M36 68 Q46 75 56 68" stroke="#FFF8EE" strokeWidth="3" strokeDasharray="3 3" strokeLinecap="round" fill="none" />
        </g>
      )}
      {archetype === 'commuter' && (
        <g>
          {/* Collar & Tie */}
          <path d="M36 66 L46 76 L56 66 Z" fill="#FFFDF8" stroke="#3D2416" strokeWidth="1.8" />
          <path d="M44 74 L48 74 L50 92 L46 95 L42 92 Z" fill="#E84C3D" stroke="#3D2416" strokeWidth="1.6" />
        </g>
      )}
      {archetype === 'tourist' && (
        <g>
          {/* Camera strap & camera */}
          <path d="M33 66 L40 85 M59 66 L52 85" stroke="#3D2416" strokeWidth="2.6" />
          <rect x="37" y="81" width="18" height="12" rx="3" fill="#3D2416" />
          <circle cx="46" cy="87" r="4" fill="#8CD7E8" stroke="#FFFDF8" strokeWidth="1.5" />
        </g>
      )}

      {/* Neck */}
      <rect x="40" y="55" width="12" height="13" rx="5" fill={skin} stroke="#3D2416" strokeWidth="2.4" />

      {/* Ears */}
      <circle cx="24" cy="42" r="5" fill={skin} stroke="#3D2416" strokeWidth="2.4" />
      <circle cx="68" cy="42" r="5" fill={skin} stroke="#3D2416" strokeWidth="2.4" />

      {/* Head */}
      <rect x="25" y="18" width="42" height="44" rx="20" fill={skin} stroke="#3D2416" strokeWidth="2.8" />

      {/* Hair / Hat */}
      {archetype === 'tourist' ? (
        <g>
          {/* Sun Visor / Bucket Hat */}
          <path d="M22 28 C23 12, 69 12, 70 28 Z" fill="#FFD166" stroke="#3D2416" strokeWidth="2.6" />
          <path d="M16 28 Q46 21 76 28 Q46 33 16 28 Z" fill="#FF9F43" stroke="#3D2416" strokeWidth="2.4" />
        </g>
      ) : archetype === 'surfer' ? (
        <g>
          {/* Wavy beach hair + sunglasses on forehead */}
          <path d="M22 36 C19 16, 36 10, 50 12 C66 13, 73 24, 69 37 C64 27, 54 24, 42 25 C32 26, 26 30, 22 36 Z" fill={hair} stroke="#3D2416" strokeWidth="2.4" />
          <rect x="28" y="18" width="15" height="8" rx="3.5" fill="#2A2D34" stroke="#FFFDF8" strokeWidth="1.8" />
          <rect x="49" y="18" width="15" height="8" rx="3.5" fill="#2A2D34" stroke="#FFFDF8" strokeWidth="1.8" />
          <line x1="43" y1="22" x2="49" y2="22" stroke="#FFFDF8" strokeWidth="2" />
        </g>
      ) : (
        <path
          d="M23 35 C21 16, 36 11, 48 12 C62 12, 71 21, 69 36 C63 26, 54 24, 44 25 C34 25, 28 29, 23 35 Z"
          fill={hair}
          stroke="#3D2416"
          strokeWidth="2.5"
        />
      )}

      {/* Engineer glasses */}
      {archetype === 'engineer' && (
        <g>
          <rect x="30" y="34" width="13" height="10" rx="4" fill="#FFFFFF" fillOpacity="0.35" stroke="#3D2416" strokeWidth="2.2" />
          <rect x="49" y="34" width="13" height="10" rx="4" fill="#FFFFFF" fillOpacity="0.35" stroke="#3D2416" strokeWidth="2.2" />
          <line x1="43" y1="39" x2="49" y2="39" stroke="#3D2416" strokeWidth="2.2" />
        </g>
      )}

      {/* Eyes & Brows */}
      {mood === 'served' ? (
        <g>
          <path d="M33 40 Q36.5 35 40 40" stroke="#3D2416" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          <path d="M52 40 Q55.5 35 59 40" stroke="#3D2416" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        </g>
      ) : (
        <g>
          <circle cx="36.5" cy="39.5" r="2.7" fill="#3D2416" />
          <circle cx="55.5" cy="39.5" r="2.7" fill="#3D2416" />
          <circle cx="37.4" cy="38.5" r="0.9" fill="#FFF" />
          <circle cx="56.4" cy="38.5" r="0.9" fill="#FFF" />
          {mood === 'impatient' && (
            <>
              <line x1="32" y1="33" x2="41" y2="36" stroke="#3D2416" strokeWidth="2.4" strokeLinecap="round" />
              <line x1="60" y1="33" x2="51" y2="36" stroke="#3D2416" strokeWidth="2.4" strokeLinecap="round" />
              {/* Sweat drop */}
              <path d="M71 29 C74 33, 74 37, 71 37 C68 37, 68 33, 71 29 Z" fill="#63D2FF" stroke="#3D2416" strokeWidth="1.5" />
            </>
          )}
        </g>
      )}

      {/* Rosy Cheeks */}
      <ellipse cx="31" cy="46" rx="3.8" ry="2.2" fill="#FF8C82" opacity="0.55" />
      <ellipse cx="61" cy="46" rx="3.8" ry="2.2" fill="#FF8C82" opacity="0.55" />

      {/* Mouth */}
      {mood === 'impatient' || mood === 'leaving' ? (
        <path d="M40 53 Q46 48 52 53" stroke="#3D2416" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      ) : mood === 'served' || mood === 'happy' ? (
        <path d="M38 49 Q46 57 54 49 Z" fill="#E84C3D" stroke="#3D2416" strokeWidth="2.2" strokeLinejoin="round" />
      ) : (
        <path d="M40 50 Q46 54 52 50" stroke="#3D2416" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      )}
    </svg>
  );
};

interface TitusvilleWindowProps {
  rocketActive: boolean;
  rocketProgress: number;
}

export const TitusvilleWindow: React.FC<TitusvilleWindowProps> = ({ rocketActive, rocketProgress }) => {
  const rocketY = 148 - rocketProgress * 185;
  const rocketX = 560 + rocketProgress * 55;

  return (
    <svg
      className="titusville-window-svg"
      viewBox="0 0 960 220"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sunriseSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF9666" />
          <stop offset="48%" stopColor="#FFC773" />
          <stop offset="100%" stopColor="#FFF0B8" />
        </linearGradient>
        <linearGradient id="indianRiver" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#52C8C6" />
          <stop offset="100%" stopColor="#2A9199" />
        </linearGradient>
      </defs>

      {/* Warm Florida Sunrise Sky */}
      <rect width="960" height="220" fill="url(#sunriseSky)" />

      {/* Rising Sun over Cape Canaveral */}
      <circle cx="480" cy="148" r="68" fill="#FFE89E" opacity="0.45" />
      <circle cx="480" cy="148" r="46" fill="#FFD166" />

      {/* Fluffy Sunrise Clouds */}
      <g fill="#FFF7E6" opacity="0.85">
        <path d="M90 66 C90 52, 114 50, 120 58 C128 48, 152 52, 154 66 Z" />
        <path d="M295 48 C295 36, 314 34, 322 41 C330 33, 352 36, 354 48 Z" />
        <path d="M720 56 C720 42, 744 40, 752 48 C762 38, 788 42, 790 56 Z" />
      </g>

      {/* Distant Cape Canaveral Launch Complex Silhouette */}
      <g fill="#B36A5E" opacity="0.55">
        <rect x="540" y="114" width="12" height="36" />
        <rect x="556" y="128" width="18" height="22" />
        <path d="M510 150 L542 142 L612 142 L640 150 Z" />
        <rect x="655" y="125" width="38" height="25" />
      </g>

      {/* Animated Rocket Launch */}
      {rocketActive && (
        <g>
          {/* Exhaust Plume Trail */}
          <path
            d={`M560 148 Q${560 + rocketProgress * 22} ${148 - rocketProgress * 85} ${rocketX} ${rocketY + 26}`}
            stroke="#FFFDF8"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.72"
            fill="none"
          />
          <g transform={`translate(${rocketX}, ${rocketY}) rotate(14)`}>
            {/* Flame */}
            <path d="M-5 16 L0 36 L5 16 Z" fill="#FF6B2B" />
            <path d="M-3 16 L0 28 L3 16 Z" fill="#FFE66D" />
            {/* Rocket Body */}
            <path d="M0 -18 C5 -10, 6 4, 6 16 L-6 16 C-6 4, -5 -10, 0 -18 Z" fill="#FFFDF8" stroke="#3D2416" strokeWidth="1.8" />
            <path d="M-6 8 L-11 18 L-5 16 Z" fill="#E84C3D" stroke="#3D2416" strokeWidth="1.4" />
            <path d="M6 8 L11 18 L5 16 Z" fill="#E84C3D" stroke="#3D2416" strokeWidth="1.4" />
            <circle cx="0" cy="-2" r="2.6" fill="#3ABEF9" stroke="#3D2416" strokeWidth="1.2" />
          </g>
        </g>
      )}

      {/* Indian River Lagoon */}
      <rect x="0" y="148" width="960" height="72" fill="url(#indianRiver)" />
      {/* Sun Shimmer on Water */}
      <g fill="#FFE89E" opacity="0.65">
        <rect x="425" y="158" width="110" height="5" rx="2.5" />
        <rect x="445" y="170" width="70" height="4" rx="2" />
        <rect x="458" y="182" width="44" height="3.5" rx="2" />
      </g>

      {/* Swaying Florida Palm Trees on Window Edges */}
      <g opacity="0.92">
        <path d="M44 220 Q56 155 72 95" stroke="#6E473B" strokeWidth="12" strokeLinecap="round" fill="none" />
        <path d="M72 95 Q32 76 10 96 Q40 94 72 95 Z" fill="#2E8B57" />
        <path d="M72 95 Q44 52 16 58 Q48 72 72 95 Z" fill="#3AA76D" />
        <path d="M72 95 Q92 54 126 66 Q96 76 72 95 Z" fill="#2E8B57" />
        <path d="M72 95 Q114 82 132 108 Q98 98 72 95 Z" fill="#3AA76D" />

        <path d="M915 220 Q900 150 882 90" stroke="#6E473B" strokeWidth="12" strokeLinecap="round" fill="none" />
        <path d="M882 90 Q842 74 820 96 Q852 92 882 90 Z" fill="#2E8B57" />
        <path d="M882 90 Q854 50 826 56 Q858 70 882 90 Z" fill="#3AA76D" />
        <path d="M882 90 Q914 52 948 64 Q912 74 882 90 Z" fill="#2E8B57" />
        <path d="M882 90 Q930 82 952 106 Q914 96 882 90 Z" fill="#3AA76D" />
      </g>

      {/* Cafe Window Mullions & Warm Awning Top */}
      <rect x="0" y="0" width="960" height="16" fill="#C94F35" />
      <g fill="#FFF3DF" opacity="0.92">
        {Array.from({ length: 16 }).map((_, i) => (
          <path
            key={i}
            d={`M${i * 60} 16 H${i * 60 + 30} V26 A15 10 0 0 1 ${i * 60} 26 Z`}
          />
        ))}
      </g>
    </svg>
  );
};

export const SeagullArt: React.FC = () => (
  <svg width="68" height="58" viewBox="0 0 68 58" fill="none" aria-hidden="true">
    <ellipse cx="34" cy="36" rx="18" ry="13" fill="#FFFFFF" stroke="#3D2416" strokeWidth="2.5" />
    <path d="M18 35 C22 25, 42 25, 48 36 C40 42, 24 42, 18 35 Z" fill="#CBD5E1" stroke="#3D2416" strokeWidth="2" />
    <circle cx="48" cy="22" r="10" fill="#FFFFFF" stroke="#3D2416" strokeWidth="2.5" />
    <path d="M56 20 L66 23 L56 26 Z" fill="#FFA928" stroke="#3D2416" strokeWidth="2" strokeLinejoin="round" />
    <circle cx="51" cy="20" r="2.2" fill="#3D2416" />
    <path d="M28 48 L25 55 M38 48 L41 55" stroke="#FFA928" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const CoffeeSpillArt: React.FC = () => (
  <svg width="74" height="44" viewBox="0 0 74 44" fill="none" aria-hidden="true">
    <path
      d="M12 24 C8 15, 22 10, 34 12 C44 6, 62 11, 64 21 C68 30, 54 38, 40 35 C26 40, 8 34, 12 24 Z"
      fill="#6F3E21"
      stroke="#3D2416"
      strokeWidth="2.2"
    />
    <ellipse cx="28" cy="20" rx="7" ry="3" fill="#9E623C" opacity="0.7" />
    <circle cx="54" cy="28" r="3" fill="#6F3E21" stroke="#3D2416" strokeWidth="1.4" />
  </svg>
);

export const SunriseLogo: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <div className={`sunrise-logo ${compact ? 'compact' : ''}`}>
    <svg width={compact ? 42 : 68} height={compact ? 42 : 68} viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <circle cx="40" cy="40" r="36" fill="#FF7A45" stroke="#4B2E1E" strokeWidth="3.5" />
      <path d="M12 48 A28 28 0 0 1 68 48 Z" fill="#FFD166" />
      {/* Sun rays */}
      <g stroke="#FFF3C4" strokeWidth="3" strokeLinecap="round">
        <line x1="40" y1="10" x2="40" y2="17" />
        <line x1="20" y1="18" x2="25" y2="23" />
        <line x1="60" y1="18" x2="55" y2="23" />
      </g>
      {/* Cup silhouette */}
      <path d="M22 44 H58 L53 64 C52 67, 28 67, 27 64 Z" fill="#4B2E1E" stroke="#FFF8EE" strokeWidth="2.5" />
      <path d="M56 48 C63 48, 63 59, 55 59" stroke="#FFF8EE" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M31 53 Q40 48 49 53" stroke="#FFD166" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
    <div className="sunrise-logo-text">
      <span className="logo-main">Sunrise Bread &amp; Coffee Co.</span>
      <span className="logo-sub">Titusville, Florida • Space Coast Morning Rush</span>
    </div>
  </div>
);
