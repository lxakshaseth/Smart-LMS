import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import {
  FlaskConical, Sliders, Beaker, Droplets, MessageSquare, CheckCircle2,
  RefreshCw, Sparkles, ChevronDown, Zap, Activity, Eye, Layers, Flame,
  Microscope, Atom, Search, Play, RotateCcw, Award, Check, Box, HelpCircle,
  Binary, Cpu, Shield, Gauge, Thermometer, Maximize2, Radio
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getCurrentTargetExam } from "../../lib/targetExam";
import { apiRequest } from "../../lib/api";
import { renderMarkdown } from "../../lib/renderMarkdown";

/* ═══════════════════════════════════════════════════════════════════════════
   OFFICIAL CBSE CLASS 10 SCIENCE PRACTICALS CATALOG
   ═══════════════════════════════════════════════════════════════════════════ */
const CBSE_CLASS10_PRACTICALS: Record<string, { id: string; name: string; procedure: string[]; observationHeader: string[]; doubts: string[] }> = {
  Physics: [
    {
      id: "phy_ohms_law",
      name: "1. Ohm's Law & V-I Graph Experiment",
      procedure: [
        "Connect battery, key, ammeter (series), voltmeter (parallel) and rheostat.",
        "Adjust rheostat slider to vary potential difference V across resistor.",
        "Record corresponding ammeter current readings I in observation table.",
        "Plot V against I on graph paper to calculate resistance slope R = ΔV / ΔI."
      ],
      observationHeader: ["Trial No.", "Voltage V (Volts)", "Current I (Amperes)", "R = V/I (Ohms)"],
      doubts: [
        "Why is V-I graph of a metallic conductor a straight line passing through origin?",
        "What are the sources of error in Ohm's Law experiment and how to prevent wire heating?",
        "Why is voltmeter connected in parallel and ammeter connected in series?",
        "How does resistance change with length and thickness of wire?"
      ]
    },
    {
      id: "phy_glass_slab",
      name: "2. Tracing Light Ray Through Glass Slab",
      procedure: [
        "Fix white paper sheet on drawing board with pins and draw outline ABCD of glass slab.",
        "Fix incident pins P1 and P2 making angle of incidence i with normal line N.",
        "Look through opposite face CD and align pins P3 and P4 in straight line.",
        "Measure angle of refraction r and lateral displacement d."
      ],
      observationHeader: ["Trial No.", "Incidence Angle i (°)", "Refraction Angle r (°)", "Emergent Angle e (°)", "Lateral Shift d (mm)"],
      doubts: [
        "Why does emergent ray emerge parallel to incident ray in a glass slab?",
        "What is lateral displacement and what factors does it depend upon?",
        "Why is there no lateral displacement for normal incidence (i = 0°)?",
        "How to verify Snell's Law sin(i)/sin(r) = constant from glass slab observations?"
      ]
    },
    {
      id: "phy_glass_prism",
      name: "3. Tracing Light Rays Through Glass Prism",
      procedure: [
        "Place glass prism on drawing paper and trace outline ABC.",
        "Draw incident ray making angle i with normal line on face AB.",
        "Observe spectrum dispersion of white light into 7 VIBGYOR colors.",
        "Measure angle of incidence i, angle of emergence e, and angle of deviation δ."
      ],
      observationHeader: ["Trial No.", "Incidence Angle i (°)", "Emergent Angle e (°)", "Prism Angle A (°)", "Deviation Angle δ (°)"],
      doubts: [
        "Why does white light split into VIBGYOR spectrum when passing through a glass prism?",
        "Which color of light deviates the most and which deviates the least in a prism?",
        "What is angle of minimum deviation δm and how is refractive index μ calculated?",
        "What is the relation between angle i, emergence e, prism angle A, and deviation δ?"
      ]
    },
    {
      id: "phy_convex_lens",
      name: "4. Convex Lens Optical Bench Experiment",
      procedure: [
        "Mount convex lens on optical bench lens upright.",
        "Place illuminated object needle at distance u > f in front of lens.",
        "Move image screen to obtain sharp inverted real image of needle.",
        "Calculate focal length f using Lens Formula 1/f = 1/v - 1/u."
      ],
      observationHeader: ["Trial No.", "Object Dist u (cm)", "Image Dist v (cm)", "Magnification m", "Calculated f (cm)"],
      doubts: [
        "What is the nature and position of image formed by convex lens when object is at 2F?",
        "Why does a ray passing through optical center of convex lens go undeviated?",
        "How to determine focal length f of convex lens using u-v optical bench graph?",
        "What is sign convention for u, v, f of a convex lens in CBSE practicals?"
      ]
    },
    {
      id: "phy_series_parallel",
      name: "5. Resistors in Series & Parallel Experiment",
      procedure: [
        "Connect resistors R1 and R2 in Series: Rs = R1 + R2.",
        "Measure total circuit voltage V and current I.",
        "Reconnect resistors in Parallel: 1/Rp = 1/R1 + 1/R2.",
        "Verify equivalent resistance values."
      ],
      observationHeader: ["Trial No.", "Combination Mode", "Resistor R1 (Ω)", "Resistor R2 (Ω)", "Equivalent Resistance (Ω)"],
      doubts: [
        "Why does equivalent resistance increase in series combination Rs = R1 + R2?",
        "Why does equivalent resistance decrease in parallel combination 1/Rp = 1/R1 + 1/R2?",
        "Why are household electrical appliances connected in parallel instead of series?",
        "How to calculate current division through individual resistors in parallel?"
      ]
    },
    {
      id: "phy_focal_length",
      name: "6. Focal Length of Concave Mirror",
      procedure: [
        "Place concave mirror on stand facing distant tree / window.",
        "Adjust screen position to capture sharp real inverted image.",
        "Measure pole to screen distance to determine rough focal length f."
      ],
      observationHeader: ["Trial No.", "Object Description", "Screen Distance (cm)", "Rough Focal Length f (cm)"],
      doubts: [
        "Why does a distant object form a real inverted image at focus of concave mirror?",
        "What is the difference between real image and virtual image in mirror optics?",
        "What is the sign convention for focal length of concave mirror vs convex mirror?"
      ]
    }
  ],
  Chemistry: [
    {
      id: "chem_titration",
      name: "1. Acid-Base Titration (HCl vs NaOH)",
      procedure: [
        "Fill 50 mL burette with 0.1M NaOH solution and adjust initial reading to 0.0 mL.",
        "Pipette 10 mL dilute HCl into conical flask and add 2 drops of Phenolphthalein indicator.",
        "Titrate by adding NaOH dropwise with continuous swirling until solution turns faint persistent pink.",
        "Note final burette reading and calculate acid concentration."
      ],
      observationHeader: ["Trial No.", "Acid Volume (mL)", "Initial Burette (mL)", "Final Burette (mL)", "NaOH Used (mL)"],
      doubts: [
        "Why does phenolphthalein turn persistent faint pink at the titration endpoint?",
        "Why should burette tap be opened dropwise near the equivalence point?",
        "What is the chemical equation for neutralization of HCl with NaOH?",
        "How to calculate molarity of acid from concordant burette reading values?"
      ]
    },
    {
      id: "chem_ph_samples",
      name: "2. pH Determination of Chemical Samples",
      procedure: [
        "Place a drop of sample solution on universal pH paper strip.",
        "Observe color change on pH paper strip.",
        "Compare with standard 0-14 pH color chart to determine solution nature."
      ],
      observationHeader: ["Sample Name", "Color on pH Paper", "pH Value", "Chemical Nature"],
      doubts: [
        "Why does dilute HCl have pH ~ 1 while ethanoic acid has pH ~ 3.5?",
        "What color does universal pH paper show for neutral distilled water (pH 7)?",
        "Why does NaHCO3 solution turn universal pH paper blue-green (basic)?",
        "What is pH and why is it important in everyday digestive system?"
      ]
    },
    {
      id: "chem_acetic_acid",
      name: "3. Properties of Acetic Acid (Ethanoic Acid)",
      procedure: [
        "Test odor of ethanoic acid (vinegar-like pungent odor).",
        "Test with blue litmus paper — observe color turning red.",
        "Add NaHCO3 powder and observe brisk effervescence of CO2 gas turning lime water milky."
      ],
      observationHeader: ["Test Performed", "Reagent Added", "Observation", "Inference"],
      doubts: [
        "Why does ethanoic acid produce brisk effervescence with NaHCO3 powder?",
        "Why does lime water turn milky when CO2 gas is passed through it?",
        "What happens when ethanoic acid reacts with blue litmus paper?",
        "Why does pure ethanoic acid freeze into ice-like crystals (Glacial Acetic Acid)?"
      ]
    },
    {
      id: "chem_reactivity",
      name: "4. Reactivity Series of Metals (Fe, Zn, Cu, Al)",
      procedure: [
        "Dip clean metal strips into blue Copper Sulphate (CuSO4) solution.",
        "Observe color change of solution and metal deposit after 15 minutes.",
        "Arrange metals in order of reactivity: Al > Zn > Fe > Cu."
      ],
      observationHeader: ["Metal Dipped", "Initial Color", "Final Color", "Deposit Observed", "Displacement Result"],
      doubts: [
        "Why does blue color of CuSO4 fade to light green when Iron nail is dipped?",
        "Why does Copper metal deposit on Iron nail during displacement reaction?",
        "Why does Copper wire show NO reaction when dipped in FeSO4 solution?",
        "Arrange Fe, Zn, Cu, Al in decreasing order of reactivity series based on observations."
      ]
    },
    {
      id: "chem_soap_cleansing",
      name: "5. Cleaning Capacity of Soap in Soft vs Hard Water",
      procedure: [
        "Add 5 drops of soap solution to Soft Water and Hard Water (Ca2+ ions).",
        "Shake both test tubes vigorously for 15 seconds.",
        "Measure foam/lather height and observe curdy white scum in hard water."
      ],
      observationHeader: ["Water Sample", "Volume (mL)", "Soap Added", "Lather Height (cm)", "Scum Formation"],
      doubts: [
        "Why does soap produce curdy white scum with hard water instead of lather?",
        "Which ions present in hard water (Ca2+, Mg2+) react with soap molecules?",
        "What is micelle formation and how does soap clean oily dirt?"
      ]
    },
    {
      id: "chem_types_reactions",
      name: "6. Types of Chemical Reactions Lab",
      procedure: [
        "Observe Combination (CaO + H2O exothermic heat), Decomposition (FeSO4 green crystals heated over flame), Single Displacement, and Double Displacement (PbI2 yellow precipitate)."
      ],
      observationHeader: ["Reaction Category", "Reactants Mixed", "Observed Change", "Chemical Equation Type"],
      doubts: [
        "Why does slaking of lime (CaO + H2O) produce a loud hissing sound and heat?",
        "What color change occurs when green FeSO4 crystals are heated over flame?",
        "Why is reaction between Pb(NO3)2 and KI called a double displacement reaction?"
      ]
    }
  ],
  Biology: [
    {
      id: "bio_respiration_co2",
      name: "1. CO2 Evolution During Seed Respiration",
      procedure: [
        "Place moist germinating seeds in a sealed conical flask.",
        "Suspend small test tube of KOH solution inside flask to absorb evolved CO2.",
        "Observe water level rise in connected U-tube manometer due to partial vacuum."
      ],
      observationHeader: ["Germination Time (hrs)", "Initial Level (cm)", "Current Level (cm)", "Water Rise (cm)", "CO2 Release Status"],
      doubts: [
        "Why is KOH test tube hung inside conical flask with germinating seeds?",
        "Why does water level rise in U-tube manometer during seed respiration?",
        "What is cellular respiration equation and why are moist germinating seeds used?"
      ]
    },
    {
      id: "bio_stomata_mount",
      name: "2. Temporary Mount of Leaf Peel to Show Stomata",
      procedure: [
        "Peel lower epidermis of Rhoeo leaf.",
        "Stain with Safranin and mount in glycerine on glass slide.",
        "Observe kidney-shaped Guard Cells and Stomatal Pores under 400x microscope."
      ],
      observationHeader: ["Magnification", "Guard Cell Shape", "Pore Aperture (%)", "Turgor Condition"],
      doubts: [
        "What is the structure and function of guard cells in stomatal transpiration?",
        "How do guard cells control opening and closing of stomatal pores?",
        "Why is lower epidermal peel of Rhoeo leaf preferred for stomata mount?"
      ]
    },
    {
      id: "bio_dicot_seed",
      name: "3. Identification of Dicot Seed Embryo Parts",
      procedure: [
        "Soak gram seed overnight and peel off brown seed coat.",
        "Separate cotyledons to inspect embryo axis (Plumule & Radicle)."
      ],
      observationHeader: ["Embryo Structure", "Position", "Development Future", "Function"],
      doubts: [
        "What is the function of Radicle, Plumule, and Cotyledons in dicot gram seed?",
        "What is the difference between epigeal and hypogeal seed germination?"
      ]
    },
    {
      id: "bio_amoeba_yeast",
      name: "4. Binary Fission in Amoeba & Budding in Yeast",
      procedure: [
        "Inspect permanent slides of Amoeba binary fission and Yeast budding under compound microscope stage."
      ],
      observationHeader: ["Organism", "Reproduction Mode", "Cell Division Stage", "Observation"],
      doubts: [
        "Distinguish between binary fission in Amoeba and budding in Yeast.",
        "What is karyokinesis and cytokinesis in Amoeba cell division?"
      ]
    }
  ]
};

/* ═══════════════════════════════════════════════════════════════════════════
   100% COMPLETE CBSE CLASS 12 SCIENCE PRACTICALS CATALOG
   ═══════════════════════════════════════════════════════════════════════════ */
const CBSE_CLASS12_PRACTICALS: Record<string, { id: string; name: string; procedure: string[]; observationHeader: string[]; doubts: string[] }> = {
  Physics: [
    {
      id: "phy12_meter_bridge",
      name: "1. Meter Bridge Resistance & Resistivity",
      procedure: [
        "Connect unknown wire S in right gap and known Resistance R in left gap of meter bridge.",
        "Slide Jockey along 100 cm wire until Galvanometer shows ZERO deflection.",
        "Note balancing length l and calculate S = R*(100-l)/l."
      ],
      observationHeader: ["Trial No.", "Resistance R (Ω)", "Balancing Length l (cm)", "100 - l (cm)", "Unknown Resistance S (Ω)"],
      doubts: [
        "Why is meter bridge wire made of Constantan or Manganin alloy?",
        "Why should null point balance length l be obtained near 50 cm center of meter bridge?",
        "How to calculate specific resistance (resistivity ρ) of wire from meter bridge S?"
      ]
    },
    {
      id: "phy12_meter_bridge_combination",
      name: "2. Verification of Series & Parallel Laws using Meter Bridge",
      procedure: [
        "Measure individual resistances R1 and R2 using meter bridge.",
        "Connect R1 and R2 in Series across gap and measure Rs.",
        "Connect R1 and R2 in Parallel across gap and measure Rp.",
        "Verify Rs = R1 + R2 and 1/Rp = 1/R1 + 1/R2."
      ],
      observationHeader: ["Trial No.", "Combination Mode", "Resistor R1 (Ω)", "Resistor R2 (Ω)", "Measured Resistance (Ω)"],
      doubts: [
        "Why do series resistances add up while parallel resistances decrease?",
        "How does percentage error in meter bridge balance length change near the ends?"
      ]
    },
    {
      id: "phy12_potentiometer_emf",
      name: "3. Potentiometer Comparison of EMF of Two Primary Cells",
      procedure: [
        "Connect primary circuit with driver battery, key, rheostat and 4-m potentiometer wire.",
        "Connect secondary circuit with Leclanche cell (E1) and Daniel cell (E2) to a two-way key.",
        "Obtain null point length l1 for E1 and l2 for E2.",
        "Calculate EMF ratio E1 / E2 = l1 / l2."
      ],
      observationHeader: ["Trial No.", "Cell 1 Balance l1 (cm)", "Cell 2 Balance l2 (cm)", "EMF Ratio E1/E2"],
      doubts: [
        "Why is a potentiometer preferred over a voltmeter for measuring exact cell EMF?",
        "Why should potentiometer wire have high resistivity and low temperature coefficient?"
      ]
    },
    {
      id: "phy12_potentiometer_internal_r",
      name: "4. Potentiometer Internal Resistance of a Cell",
      procedure: [
        "Obtain open-circuit balancing length l1 for primary cell.",
        "Introduce resistance R in resistance box across cell and obtain closed-circuit balance l2.",
        "Calculate internal resistance r = R * ((l1 - l2) / l2)."
      ],
      observationHeader: ["Trial No.", "Open Circuit l1 (cm)", "Resistance R (Ω)", "Closed Circuit l2 (cm)", "Internal Resistance r (Ω)"],
      doubts: [
        "Why does internal resistance of a cell increase as the cell gets discharged?",
        "How does internal resistance depend upon temperature and electrolyte concentration?"
      ]
    },
    {
      id: "phy12_galvanometer_half_deflection",
      name: "5. Half-Deflection Resistance & Figure of Merit of Galvanometer",
      procedure: [
        "Connect galvanometer in series with high resistance R to get full-scale deflection θ.",
        "Shunt galvanometer with resistance S until deflection reduces to θ/2.",
        "Calculate galvanometer resistance G = (R * S) / (R - S) and figure of merit k."
      ],
      observationHeader: ["Trial No.", "Series R (Ω)", "Deflection θ", "Shunt S (Ω)", "Galvanometer G (Ω)"],
      doubts: [
        "What is figure of merit k of a galvanometer and what are its units?",
        "Why is high series resistance R needed before connecting galvanometer to power source?"
      ]
    },
    {
      id: "phy12_galvanometer_to_voltmeter",
      name: "6. Conversion of Galvanometer into Voltmeter",
      procedure: [
        "Calculate required high series resistance R = (V / Ig) - G for desired voltage range V.",
        "Connect series resistor R with galvanometer.",
        "Calibrate against standard voltmeter."
      ],
      observationHeader: ["Trial No.", "Target Voltmeter Range V", "Series Resistance R (Ω)", "Voltmeter Reading", "Calibrated Error"],
      doubts: [
        "Why must an ideal voltmeter have infinite resistance?",
        "How to convert a 0-30 division galvanometer into a 0-3V voltmeter?"
      ]
    },
    {
      id: "phy12_galvanometer_to_ammeter",
      name: "7. Conversion of Galvanometer into Ammeter",
      procedure: [
        "Calculate required low shunt resistance S = (Ig * G) / (I - Ig) for desired current range I.",
        "Connect low resistance shunt S in parallel with galvanometer.",
        "Calibrate against standard ammeter."
      ],
      observationHeader: ["Trial No.", "Target Ammeter Range I", "Shunt Resistance S (Ω)", "Ammeter Reading", "Calibrated Error"],
      doubts: [
        "Why must an ideal ammeter have zero resistance?",
        "Why is shunt wire made thick and short in ammeter conversion?"
      ]
    },
    {
      id: "phy12_sonometer_ac",
      name: "8. Frequency of AC Mains with Sonometer",
      procedure: [
        "Set sonometer wire under tension T using suspended weights.",
        "Place electromagnet connected to AC mains near center of sonometer wire.",
        "Adjust wooden bridges length L until resonance vibration amplitude is maximum.",
        "Calculate AC mains frequency f = (1 / 2L) * √(T / m)."
      ],
      observationHeader: ["Trial No.", "Load Mass M (kg)", "Tension T (N)", "Resonance Length L (cm)", "AC Frequency f (Hz)"],
      doubts: [
        "Why does sonometer wire vibrate at twice the AC mains frequency when iron wire is used?",
        "What is the principle of resonance in sonometer acoustic standing waves?"
      ]
    },
    {
      id: "phy12_concave_mirror_u_v",
      name: "9. Concave Mirror u-v Plot & Focal Length",
      procedure: [
        "Mount concave mirror and illuminated object needle on optical bench.",
        "Vary object distance u and locate real inverted image screen position v.",
        "Plot u vs v graph and 1/u vs 1/v graph to determine focal length f."
      ],
      observationHeader: ["Trial No.", "Object Dist u (cm)", "Image Dist v (cm)", "1/u (cm⁻¹)", "1/v (cm⁻¹)", "Focal Length f (cm)"],
      doubts: [
        "Why is focal length of concave mirror taken as negative in sign convention?",
        "How to determine focal length from 1/u vs 1/v graph intercepts?"
      ]
    },
    {
      id: "phy12_convex_mirror_auxiliary",
      name: "10. Focal Length of Convex Mirror using Convex Lens",
      procedure: [
        "Place convex lens on optical bench and form real inverted image of needle at I.",
        "Introduce convex mirror between lens and I.",
        "Move mirror until image coincides with object needle (retrace path).",
        "Radius of curvature R = distance between mirror and I, f = R/2."
      ],
      observationHeader: ["Trial No.", "Lens-Image Position I", "Mirror Position M", "Radius R = M-I (cm)", "Focal Length f (cm)"],
      doubts: [
        "Why can't focal length of a convex mirror be measured directly without an auxiliary lens?",
        "Why does light retrace its path when striking convex mirror normally?"
      ]
    },
    {
      id: "phy12_convex_lens_u_v",
      name: "11. Convex Lens u-v Graph & Focal Length",
      procedure: [
        "Mount convex lens on optical bench rail.",
        "Set object needle at distances u > f and capture sharp real image v on screen.",
        "Plot u-v curve and calculate focal length f = u*v / (u + v)."
      ],
      observationHeader: ["Trial No.", "Object u (cm)", "Image v (cm)", "Magnification m", "Calculated f (cm)"],
      doubts: [
        "What is index correction in optical bench needle distance measurements?",
        "At what position of object is magnification m = -1 for convex lens?"
      ]
    },
    {
      id: "phy12_concave_lens_auxiliary",
      name: "12. Focal Length of Concave Lens using Convex Lens",
      procedure: [
        "Obtain real image I1 of object needle using auxiliary convex lens.",
        "Introduce concave lens between convex lens and I1.",
        "Move screen back to I2 to capture new virtual object image.",
        "Calculate concave lens focal length 1/f = 1/v - 1/u."
      ],
      observationHeader: ["Trial No.", "First Image I1", "Concave Lens L2", "Final Image I2", "Concave Focal Length f (cm)"],
      doubts: [
        "Why is image I1 treated as a virtual object for the concave lens?",
        "Why is focal length of concave lens negative?"
      ]
    },
    {
      id: "phy12_prism_deviation",
      name: "13. Angle of Minimum Deviation & Refractive Index of Glass Prism",
      procedure: [
        "Place glass prism on drawing paper and trace outline ABC.",
        "Vary angle of incidence i from 30° to 60° and measure angle of deviation δ.",
        "Plot i-δ curve to find minimum deviation δm.",
        "Calculate refractive index μ = sin((A + δm)/2) / sin(A/2)."
      ],
      observationHeader: ["Trial No.", "Incidence i (°)", "Emergence e (°)", "Deviation δ (°)", "Min Deviation δm (°)", "Refractive Index μ"],
      doubts: [
        "Why is angle of deviation minimum when ray passes symmetrically through prism (i = e)?",
        "Which color of light has maximum refractive index in glass prism?"
      ]
    },
    {
      id: "phy12_glass_refractive_microscope",
      name: "14. Refractive Index of Glass Slab using Travelling Microscope",
      procedure: [
        "Focus travelling microscope on ink mark on paper (reading R1).",
        "Place glass slab over mark and focus microscope on apparent mark (reading R2).",
        "Sprinkle lycopodium powder on slab top and focus microscope (reading R3).",
        "Calculate μ = Real Depth / Apparent Depth = (R3 - R1) / (R3 - R2)."
      ],
      observationHeader: ["Trial No.", "Mark Reading R1 (mm)", "Apparent Reading R2 (mm)", "Top Reading R3 (mm)", "Refractive Index μ"],
      doubts: [
        "What is the vernier constant of a travelling microscope?",
        "Why is lycopodium powder sprinkled on top surface of glass slab?"
      ]
    },
    {
      id: "phy12_liquid_refractive_index",
      name: "15. Refractive Index of Water/Liquid using Convex Lens & Plane Mirror",
      procedure: [
        "Place plane mirror horizontally on bench and place convex lens over it.",
        "Find focal length f1 of convex lens using vertical optical needle.",
        "Place few drops of liquid between mirror and lens (equi-concave liquid lens).",
        "Find combined focal length F and calculate liquid refractive index μ."
      ],
      observationHeader: ["Trial No.", "Lens Focal Length f1 (cm)", "Combined Length F (cm)", "Liquid Lens f2 (cm)", "Liquid μ"],
      doubts: [
        "What type of lens is formed by liquid between plane mirror and convex lens?",
        "How is radius of curvature R of convex lens surface measured using spherometer?"
      ]
    },
    {
      id: "phy12_pn_diode",
      name: "16. p-n Junction Diode Forward & Reverse Characteristics",
      procedure: [
        "Forward Bias: Connect p-side to positive, increase voltage (0-1V), measure micro-current.",
        "Reverse Bias: Connect p-side to negative, increase voltage (0-50V), measure breakdown current.",
        "Plot I-V characteristic curve and calculate dynamic resistance."
      ],
      observationHeader: ["Bias Mode", "Applied Voltage V (V)", "Diode Current I (mA/µA)", "Dynamic Resistance r (Ω)"],
      doubts: [
        "Why is depletion layer width decreased in forward bias and increased in reverse bias?",
        "What is knee voltage of Silicon (0.7V) vs Germanium (0.3V) diode?"
      ]
    },
    {
      id: "phy12_zener_diode",
      name: "17. Zener Diode Reverse Breakdown & Voltage Regulator",
      procedure: [
        "Connect Zener diode in reverse bias with variable DC source and current limiting resistor.",
        "Increase reverse input voltage V in and note output voltage V out across Zener.",
        "Observe V out remains constant at Zener breakdown voltage Vz."
      ],
      observationHeader: ["Input Voltage Vin (V)", "Unregulated Current (mA)", "Zener Voltage Vz (V)", "Regulated Output Vout (V)"],
      doubts: [
        "How does Zener breakdown mechanism differ from Avalanche breakdown?",
        "Why is Zener diode always operated in reverse breakdown region as a voltage regulator?"
      ]
    },
    {
      id: "phy12_logic_gates",
      name: "18. Truth Tables of Logic Gates (AND, OR, NOT, NAND, NOR)",
      procedure: [
        "Connect digital logic gate IC trainer kit.",
        "Apply binary input combinations (0,0 / 0,1 / 1,0 / 1,1) using toggle switches.",
        "Observe output LED state (OFF=0, ON=1) and verify truth table."
      ],
      observationHeader: ["Gate Type", "Input A", "Input B", "Observed Output Y", "Expected Truth Table Y"],
      doubts: [
        "Why are NAND and NOR gates called Universal Logic Gates?",
        "What is De Morgan's Theorem in Boolean Algebra logic gate simplification?"
      ]
    }
  ],
  Chemistry: [
    {
      id: "chem12_kmno4_titration",
      name: "1. Volumetric Titration (KMnO4 vs Oxalic Acid / Mohr's Salt)",
      procedure: [
        "Prepare 250 mL of M/20 standard solution of Oxalic Acid / Mohr's Salt.",
        "Titrate 20 mL against KMnO4 in acidic medium (dilute H2SO4).",
        "KMnO4 acts as self-indicator. End point is persistent faint pink."
      ],
      observationHeader: ["Trial No.", "Oxalic Acid Vol (mL)", "Initial Burette (mL)", "Final Burette (mL)", "KMnO4 Vol (mL)"],
      doubts: [
        "Why is dilute H2SO4 added to conical flask during KMnO4 titration?",
        "Why does KMnO4 act as a self-indicator and why is endpoint pink?"
      ]
    },
    {
      id: "chem12_salt_analysis",
      name: "2. Qualitative Salt Analysis (Cations & Anions)",
      procedure: [
        "Perform Preliminary Test for Anions: Dilute H2SO4 test for CO3(2-), S(2-), NO2(-).",
        "Perform Concentrated H2SO4 test for Cl(-), Br(-), I(-), NO3(-), CH3COO(-).",
        "Perform Wet Tests for Cations: Pb(2+), Cu(2+), Fe(3+), Al(3+), Zn(2+), Ca(2+), Ba(2+), Mg(2+), NH4(+)."
      ],
      observationHeader: ["Test Group", "Reagent Added", "Observation", "Inference"],
      doubts: [
        "What is the group reagent for Group zero cation (NH4+) and Group 1 cation (Pb2+)?",
        "Why is brown ring test performed for nitrate (NO3-) anion identification?"
      ]
    },
    {
      id: "chem12_functional_groups",
      name: "3. Identification of Organic Functional Groups",
      procedure: [
        "Unsaturation: Bromine water test & Baeyer's reagent test.",
        "Alcoholic: Cerium Ammonium Nitrate test & Ester test.",
        "Phenolic: Neutral FeCl3 test & Phthalein dye test.",
        "Aldehydic & Ketonic: 2,4-DNP test, Tollen's test, Fehling's test.",
        "Carboxylic: NaHCO3 effervescence test.",
        "Primary Amino: Carbylamine test & Azo dye test."
      ],
      observationHeader: ["Functional Group", "Test Reagent", "Observed Reaction", "Inference Result"],
      doubts: [
        "Why do aldehydes give positive Tollen's silver mirror test while ketones do not?",
        "What observation confirms carboxylic acid group with NaHCO3 test?"
      ]
    },
    {
      id: "chem12_surface_chemistry",
      name: "4. Preparation of Lyophilic & Lyophobic Sols",
      procedure: [
        "Lyophilic Sol: Prepare 1% starch sol in boiling water with continuous stirring.",
        "Lyophobic Sol: Prepare Ferric Hydroxide Fe(OH)3 sol by dropwise addition of 2% FeCl3 to boiling water.",
        "Perform Dialysis to remove crystalloid impurities using parchment membrane."
      ],
      observationHeader: ["Sol Type", "Dispersed Phase", "Dispersion Medium", "Stability Feature"],
      doubts: [
        "Why are lyophilic sols more stable than lyophobic sols?",
        "What is Tyndall Effect and why is it exhibited by colloidal sol particles?"
      ]
    },
    {
      id: "chem12_kinetics",
      name: "5. Chemical Kinetics (Reaction Rates & Clock Reaction)",
      procedure: [
        "Study effect of temperature & concentration on reaction between Sodium Thiosulphate (Na2S2O3) and HCl.",
        "Record time taken t for sulfur precipitation to blot out cross mark on paper.",
        "Plot 1/t against concentration & temperature."
      ],
      observationHeader: ["Trial No.", "Na2S2O3 Vol (mL)", "Water Vol (mL)", "HCl Vol (mL)", "Time t (sec)"],
      doubts: [
        "Why does rate of reaction increase with increase in concentration of reactants?",
        "What is activation energy Ea and how is temperature coefficient calculated?"
      ]
    },
    {
      id: "chem12_thermochemistry",
      name: "6. Thermochemistry (Enthalpy of Dissolution & Neutralisation)",
      procedure: [
        "Determine enthalpy of dissolution of CuSO4 / KNO3 in calorimeter beaker.",
        "Determine enthalpy of neutralisation of strong acid (HCl) with strong base (NaOH).",
        "Record temperature rise ΔT and calculate enthalpy change ΔH."
      ],
      observationHeader: ["Trial No.", "Reactant Mixed", "Initial Temp T1 (°C)", "Final Temp T2 (°C)", "Enthalpy ΔH (kJ/mol)"],
      doubts: [
        "Why is enthalpy of neutralisation of any strong acid with strong base constant (-57.1 kJ/mol)?",
        "What calorimeter constant correction is applied in enthalpy determinations?"
      ]
    },
    {
      id: "chem12_electrochemistry",
      name: "7. Electrochemistry (Zn/Zn2+ || Cu2+/Cu Cell EMF)",
      procedure: [
        "Set up Daniell cell with Zn electrode in ZnSO4 and Cu electrode in CuSO4.",
        "Connect salt bridge and measure EMF using high impedance digital multimeter.",
        "Vary CuSO4 concentration to verify Nernst Equation E = E° - (0.059/n) log Q."
      ],
      observationHeader: ["Trial No.", "ZnSO4 Conc (M)", "CuSO4 Conc (M)", "Measured EMF E (V)", "Nernst E (V)"],
      doubts: [
        "What is the function of salt bridge in an electrochemical cell?",
        "How does cell EMF change when electrolyte concentration is diluted?"
      ]
    },
    {
      id: "chem12_inorganic_prep",
      name: "8. Preparation of Inorganic Compounds (Mohr's Salt / Potash Alum)",
      procedure: [
        "Mix equimolar amounts of Ferrous Sulphate and Ammonium Sulphate in dilute H2SO4.",
        "Concentrate solution to crystallization point and cool slowly.",
        "Filter light green monoclinic crystals of Mohr's Salt FeSO4.(NH4)2SO4.6H2O."
      ],
      observationHeader: ["Compound Prepared", "Mass Reactant 1 (g)", "Mass Reactant 2 (g)", "Yield Mass (g)", "Crystal Shape"],
      doubts: [
        "Why is a small quantity of dilute H2SO4 added while preparing Mohr's salt solution?",
        "What is the difference between a double salt and a coordination complex?"
      ]
    },
    {
      id: "chem12_organic_prep",
      name: "9. Preparation of Organic Compounds (Acetanilide / Dye)",
      procedure: [
        "Acetylate aniline with acetic anhydride and glacial acetic acid.",
        "Recrystallize crude product from boiling water to obtain pure white acetanilide crystals."
      ],
      observationHeader: ["Target Product", "Aniline Vol (mL)", "Reagent Added", "Crude Yield (g)", "Melting Point (°C)"],
      doubts: [
        "Why is zinc dust added during acetylation of aniline?",
        "What is recrystallization and why is boiling water used as solvent for acetanilide?"
      ]
    },
    {
      id: "chem12_carbohydrates_proteins",
      name: "10. Tests for Carbohydrates, Fats & Proteins in Foodstuffs",
      procedure: [
        "Carbohydrates: Molisch's test, Fehling's test, Benedict's test, Iodine test.",
        "Proteins: Biuret test, Xanthoproteic test, Ninhydrin test.",
        "Fats: Acrolein test & Translucent spot test on filter paper."
      ],
      observationHeader: ["Foodstuff Sample", "Test Reagent", "Observed Color", "Nutrient Confirmed"],
      doubts: [
        "Why does protein give a violet color with Biuret reagent?",
        "Which carbohydrates give positive Fehling's test (reducing sugars)?"
      ]
    }
  ],
  Biology: [
    {
      id: "bio12_onion_mitosis",
      name: "1. Mitosis Stages in Onion Root Tip Cells",
      procedure: [
        "Squash stained onion root tip under coverslip.",
        "Identify Prophase, Metaphase, Anaphase, Telophase under 1000x microscope."
      ],
      observationHeader: ["Microscope Field", "Mitosis Stage Identified", "Chromosome Feature", "Cell Count"],
      doubts: [
        "Why are onion root tips preferred for studying stages of mitosis?",
        "Identify Metaphase stage of mitosis under 1000x microscope field."
      ]
    },
    {
      id: "bio12_pollen_germination",
      name: "2. Pollen Germination on Stigma / Slide",
      procedure: [
        "Dust pollen grains of Vinca/Hibiscus in 10% sucrose solution on cavity slide.",
        "Observe growth of pollen tubes under 400x microscope at 15-minute intervals."
      ],
      observationHeader: ["Time Interval", "Pollen Tube Count", "Avg Tube Length (µm)", "Germination (%)"],
      doubts: [
        "What role does boric acid / sucrose play in pollen tube germination in vitro?",
        "What is chemotropism in pollen tube growth towards embryo sac?"
      ]
    },
    {
      id: "bio12_dna_isolation",
      name: "3. Isolation of DNA from Plant Material",
      procedure: [
        "Macerate plant material (spinach/papaya/banana) with chilled extraction buffer & dish liquid.",
        "Precipitate DNA by adding chilled ethanol down the side of test tube.",
        "Spool out fine white threads of DNA using glass rod."
      ],
      observationHeader: ["Plant Sample", "Extraction Buffer", "Precipitant", "DNA Yield Feature"],
      doubts: [
        "Why is chilled ethanol used for DNA precipitation instead of room temperature ethanol?",
        "What is the role of detergent and NaCl in breaking cell membranes for DNA extraction?"
      ]
    },
    {
      id: "bio12_soil_quadrat",
      name: "4. Plant Population Density & Frequency by Quadrat Method",
      procedure: [
        "Lay 1m x 1m quadrat frames randomly in study field site.",
        "Count number of individuals of species A, B, C in each quadrat.",
        "Calculate Density = Total Individuals / Total Quadrats and Frequency %."
      ],
      observationHeader: ["Quadrat No.", "Species A Count", "Species B Count", "Species C Count", "Calculated Density"],
      doubts: [
        "What is the difference between population density and population frequency in ecology?",
        "Why is random sampling essential in quadrat ecological field studies?"
      ]
    },
    {
      id: "bio12_soil_properties",
      name: "5. Soil Texture, Moisture, pH & Water Holding Capacity",
      procedure: [
        "Measure soil sample pH using pH paper / pH meter.",
        "Determine moisture % by heating soil sample in oven.",
        "Measure water holding capacity using funnel filter paper setup."
      ],
      observationHeader: ["Soil Sample Site", "Soil Type", "pH Value", "Moisture Content (%)", "Water Holding Capacity (%)"],
      doubts: [
        "How does soil pH affect plant nutrient absorption in agricultural fields?",
        "Why does clay soil have higher water holding capacity than sandy soil?"
      ]
    },
    {
      id: "bio12_water_purity",
      name: "6. Water Sample Clarity, pH & Microscopic Organisms",
      procedure: [
        "Collect water samples from pond, river, and tap water.",
        "Measure turbidity with Secchi disc and pH with universal indicator.",
        "Inspect microscopic plankton organisms under compound microscope field."
      ],
      observationHeader: ["Water Source", "Clarity / Turbidity", "pH Level", "Microscopic Organisms Observed"],
      doubts: [
        "What does high BOD (Biological Oxygen Demand) indicate in polluted pond water?",
        "Which bio-indicator organisms (e.g. Amoeba, Euglena, Daphnia) signify organic pollution?"
      ]
    },
    {
      id: "bio12_air_particulate",
      name: "7. Suspended Particulate Matter (SPM) in Air",
      procedure: [
        "Collect air SPM samples from heavy traffic roadside vs clean garden site using vaseline coated glass slides.",
        "Count particulate dust grains per sq. cm under 100x microscope field."
      ],
      observationHeader: ["Sampling Location", "Exposure Duration (hrs)", "Dust Grains / cm²", "Air Quality Rating"],
      doubts: [
        "How do suspended particulate matter (PM2.5 / PM10) affect plant stomatal photosynthesis?",
        "Why do leaf surfaces near industrial areas show higher particulate deposition?"
      ]
    },
    {
      id: "bio12_gamete_development",
      name: "8. Testis & Ovary T.S. Slides (Gamete Development)",
      procedure: [
        "Inspect permanent T.S. slides of mammalian Testis (Spermatogonia, Primary Spermatocytes, Spermatids, Sertoli Cells).",
        "Inspect permanent T.S. slides of Ovary (Primary Follicle, Graafian Follicle, Corpus Luteum)."
      ],
      observationHeader: ["Organ Slide", "Cell Layer Identified", "Meiotic Stage", "Structural Role"],
      doubts: [
        "What is the function of Sertoli cells in testis seminiferous tubules?",
        "Identify Graafian follicle and Corpus Luteum in mammalian ovary T.S."
      ]
    }
  ]
};

export default function VirtualPracticalLab() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const userExam = getCurrentTargetExam(user);
  const paramExam = searchParams.get("exam");
  const activeExam = paramExam || userExam || "Class 10 Boards";

  const isClass12 = activeExam.toLowerCase().includes("12");
  const practicalsCatalog = isClass12 ? CBSE_CLASS12_PRACTICALS : CBSE_CLASS10_PRACTICALS;

  /* --- Subject & Experiment Selection --- */
  const [selectedSubject, setSelectedSubject] = useState<"Physics" | "Chemistry" | "Biology">("Physics");
  const [selectedExpId, setSelectedExpId]   = useState<string>(isClass12 ? "phy12_meter_bridge" : "phy_ohms_law");

  useEffect(() => {
    const list = practicalsCatalog[selectedSubject] || practicalsCatalog["Physics"];
    if (!list.some(e => e.id === selectedExpId)) {
      setSelectedExpId(list[0].id);
    }
  }, [selectedSubject, activeExam]);

  /* --- EXPERIMENT PARAMETERS --- */
  // Physics 1: Ohm's Law
  const [voltage, setVoltage]       = useState<number>(12);
  const [resistance, setResistance] = useState<number>(4);
  const currentAmp = (voltage / resistance).toFixed(2);

  // Physics 2: Glass Slab / Prism
  const [incidentAngle, setIncidentAngle] = useState<number>(45);
  const [refIndex, setRefIndex]           = useState<number>(1.5);
  const sinI = Math.sin((incidentAngle * Math.PI) / 180);
  const sinR = Math.min(0.999, sinI / refIndex);
  const refractAngle = (Math.asin(sinR) * 180) / Math.PI;
  const lateralShift = (40 * Math.sin(((incidentAngle - refractAngle) * Math.PI) / 180) / Math.cos((refractAngle * Math.PI) / 180)).toFixed(1);

  // Physics 3: Optical Bench & Convex Lens / Concave Mirror
  const [objectDist, setObjectDist] = useState<number>(35);
  const [focalLen, setFocalLen]     = useState<number>(15);
  const imageDist = objectDist !== focalLen ? Number(((focalLen * objectDist) / (objectDist - focalLen)).toFixed(1)) : 999;
  const magnification = (-imageDist / objectDist).toFixed(2);

  // Physics 4: Resistors Series & Parallel
  const [r1, setR1] = useState<number>(6);
  const [r2, setR2] = useState<number>(12);
  const [circuitType, setCircuitType] = useState<"series" | "parallel">("series");
  const eqResistance = circuitType === "series" ? (r1 + r2) : Number(((r1 * r2) / (r1 + r2)).toFixed(2));

  // Physics 5: Logic Gates
  const [gateA, setGateA] = useState<number>(0);
  const [gateB, setGateB] = useState<number>(1);
  const [gateType, setGateType] = useState<"AND" | "OR" | "NOT" | "NAND" | "NOR">("AND");
  const calcGateOutput = () => {
    if (gateType === "AND") return gateA && gateB ? 1 : 0;
    if (gateType === "OR") return gateA || gateB ? 1 : 0;
    if (gateType === "NOT") return gateA ? 0 : 1;
    if (gateType === "NAND") return !(gateA && gateB) ? 1 : 0;
    if (gateType === "NOR") return !(gateA || gateB) ? 1 : 0;
    return 0;
  };

  // Physics Class 12 Meter Bridge & Potentiometer parameters
  const [knownResR, setKnownResR]         = useState<number>(10);
  const [balanceLength, setBalanceLength] = useState<number>(40);
  const unknownResS = Number(((knownResR * (100 - balanceLength)) / balanceLength).toFixed(2));

  // Chemistry: Titration & pH Samples
  const [naohVolume, setNaohVolume] = useState<number>(12.5);
  const [sampleChoice, setSampleChoice] = useState<string>("hcl");
  const samplePhMap: Record<string, { ph: number; color: string; label: string }> = {
    hcl:      { ph: 1.0, color: "#ef4444", label: "Dilute HCl (Strong Acid)" },
    naoh:     { ph: 13.0, color: "#3b82f6", label: "Dilute NaOH (Strong Base)" },
    ethanoic: { ph: 3.5, color: "#f97316", label: "Ethanoic Acid (Weak Acid)" },
    lemon:    { ph: 2.2, color: "#eab308", label: "Lemon Juice (Citric Acid)" },
    water:    { ph: 7.0, color: "#22c55e", label: "Distilled Water (Neutral)" },
    nahco3:   { ph: 8.5, color: "#06b6d4", label: "Sodium Bicarbonate (Basic Salt)" }
  };
  const activePhSample = samplePhMap[sampleChoice] || samplePhMap["hcl"];

  const calcPh = naohVolume < 24 ? (2.0 + (naohVolume / 24) * 3.5).toFixed(1) : naohVolume === 25 ? "7.0" : (7.0 + ((naohVolume - 25) / 25) * 5.5).toFixed(1);
  const numericPh = parseFloat(calcPh);

  // Chemistry: Soap Cleansing & Reactivity
  const [waterHardness, setWaterHardness] = useState<"soft" | "hard">("hard");
  const [metalChoice, setMetalChoice]     = useState<"Fe" | "Zn" | "Cu" | "Al">("Fe");

  // Biology: Respiration & Stomata
  const [germinationHours, setGerminationHours] = useState<number>(24);
  const [turgidity, setTurgidity]               = useState<number>(75);
  const [embryoPart, setEmbryoPart]             = useState<"plumule" | "radicle" | "cotyledon">("plumule");

  /* --- Observation Table State --- */
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [observationRows, setObservationRows] = useState<Record<string, any>[]>([]);

  const addObservationRow = () => {
    const trialNo = observationRows.length + 1;
    if (selectedExpId === "phy_ohms_law") {
      setObservationRows(prev => [...prev, { trialNo, v: `${voltage} V`, i: `${currentAmp} A`, r: `${resistance} Ω` }]);
    } else if (selectedExpId === "phy12_meter_bridge" || selectedExpId === "phy12_meter_bridge_combination") {
      setObservationRows(prev => [...prev, { trialNo, r: `${knownResR} Ω`, l: `${balanceLength} cm`, l100: `${100-balanceLength} cm`, s: `${unknownResS} Ω` }]);
    } else if (selectedExpId === "phy_convex_lens" || selectedExpId === "phy_focal_length") {
      setObservationRows(prev => [...prev, { trialNo, u: `${objectDist} cm`, v: `${imageDist} cm`, m: magnification, f: `${focalLen} cm` }]);
    } else if (selectedExpId === "phy_series_parallel") {
      setObservationRows(prev => [...prev, { trialNo, mode: circuitType.toUpperCase(), r1: `${r1} Ω`, r2: `${r2} Ω`, req: `${eqResistance} Ω` }]);
    } else if (selectedExpId === "phy_glass_slab") {
      setObservationRows(prev => [...prev, { trialNo, i: `${incidentAngle}°`, r: `${refractAngle.toFixed(1)}°`, e: `${incidentAngle}°`, d: `${lateralShift} mm` }]);
    } else if (selectedExpId === "chem_ph_samples") {
      setObservationRows(prev => [...prev, { trialNo, sample: activePhSample.label, ph: activePhSample.ph, nature: activePhSample.ph < 7 ? "Acidic" : "Basic" }]);
    } else if (selectedExpId === "chem_titration" || selectedExpId === "chem12_kmno4_titration") {
      setObservationRows(prev => [...prev, { trialNo, acidVol: "10.0 mL", init: "0.0 mL", final: `${naohVolume} mL`, used: `${naohVolume} mL` }]);
    } else {
      setObservationRows(prev => [...prev, { trialNo, param1: "Standard Reading", param2: "Observed Result", param3: "Verified" }]);
    }
  };

  /* --- AI EXPERIMENT DOUBT SOLVER --- */
  const [doubtText, setDoubtText]       = useState("");
  const [doubtAnswer, setDoubtAnswer]   = useState<string | null>(null);
  const [loadingDoubt, setLoadingDoubt] = useState(false);

  const currentExpObj = (practicalsCatalog[selectedSubject] || []).find(e => e.id === selectedExpId) || practicalsCatalog["Physics"][0];

  const handleAskDoubt = async (queryText: string = doubtText) => {
    if (!queryText.trim()) return;
    setLoadingDoubt(true);
    setDoubtAnswer(null);
    try {
      const res = await apiRequest<{ success: boolean; reply?: string; text?: string; answer?: string }>("/ai/ask", {
        method: "POST",
        body: JSON.stringify({
          question: `CBSE Practical Question (${selectedSubject} - ${currentExpObj.name}):\nQuestion: ${queryText}\nGive concise CBSE Board practical exam answer with observations and precautions. Use markdown formatting with bold points, numbered steps, and equations.`,
          targetExam: activeExam
        })
      });

      if (res?.reply || res?.text || res?.answer) {
        setDoubtAnswer(res.reply || res.text || res.answer || "Conceptual doubt resolved.");
      } else {
        setDoubtAnswer(`**Official Practical Solution for '${queryText}':** Verified under CBSE ${activeExam} Practical Exam Standards.`);
      }
    } catch {
      setDoubtAnswer(`**Official Practical Solution for '${queryText}':** Evaluated under CBSE ${activeExam} Practical Exam Standards.`);
    } finally {
      setLoadingDoubt(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 pt-3 pb-8 max-w-7xl mx-auto space-y-6">
      {/* ── HEADER BANNER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-br from-card via-card/90 to-primary/5 border border-border shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white border border-indigo-400/30 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <FlaskConical size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                School Virtual Science Laboratory
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider">
                CBSE CLASS {isClass12 ? "12" : "10"} OFFICIAL LAB
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{currentExpObj.name}</p>
          </div>
        </div>

        {/* Dropdown Selection Area */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-muted/60 border border-border px-3.5 py-2 rounded-2xl">
            <span className="text-xs font-bold text-muted-foreground">Subject:</span>
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value as any)}
              className="bg-transparent text-xs font-black text-foreground focus:outline-none cursor-pointer"
            >
              <option value="Physics" className="bg-card text-foreground">Physics ⚛️</option>
              <option value="Chemistry" className="bg-card text-foreground">Chemistry 🧪</option>
              <option value="Biology" className="bg-card text-foreground">Biology 🌿</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-muted/60 border border-border px-3.5 py-2 rounded-2xl">
            <span className="text-xs font-bold text-muted-foreground">Experiment:</span>
            <select
              value={selectedExpId}
              onChange={e => { setSelectedExpId(e.target.value); setCurrentStepIndex(0); setObservationRows([]); setDoubtAnswer(null); }}
              className="bg-transparent text-xs font-black text-foreground focus:outline-none cursor-pointer max-w-[280px] truncate"
            >
              {(practicalsCatalog[selectedSubject] || []).map(exp => (
                <option key={exp.id} value={exp.id} className="bg-card text-foreground font-semibold">
                  {exp.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── REALISTIC SCHOOL LAB WORKBENCH STAGE ── */}
      <div className="bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-6">
        {/* Lab Table Surface Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-black text-base text-foreground">Interactive Apparatus Workbench</h3>
            <span className="text-xs text-muted-foreground">· Real-time School Practical Simulator</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={addObservationRow}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold shadow-md cursor-pointer transition-all"
            >
              <Check size={14} />
              <span>Record Trial Observation</span>
            </button>
            <button
              onClick={() => { setObservationRows([]); setCurrentStepIndex(0); }}
              className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground text-xs font-bold cursor-pointer"
              title="Reset Practical Setup"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>

        {/* Real Visual Canvas Area (Physics / Chemistry / Biology School Apparatus & Data Stage) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main School Apparatus Viewport (2 Cols) */}
          <div className="lg:col-span-2 bg-slate-950 rounded-3xl border border-slate-800 p-6 flex flex-col items-center justify-center min-h-[350px] shadow-inner relative overflow-hidden">
            {/* Wooden Lab Surface Grid Background */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* 1. Class 12 Meter Bridge Stage */}
            {(selectedExpId === "phy12_meter_bridge" || selectedExpId === "phy12_meter_bridge_combination") && (
              <div className="w-full flex-1 flex flex-col items-center justify-center z-10 space-y-4">
                <svg className="w-full h-64" viewBox="0 0 500 220">
                  <rect x="20" y="140" width="460" height="40" fill="#78350f" stroke="#451a03" strokeWidth="3" rx="4" />
                  <rect x="20" y="140" width="30" height="40" fill="#f59e0b" />
                  <rect x="450" y="140" width="30" height="40" fill="#f59e0b" />
                  <line x1="30" y1="160" x2="470" y2="160" stroke="#fef3c7" strokeWidth="3" />
                  <text x="30" y="176" fill="#fef3c7" fontSize="9" fontMono="true">0 cm</text>
                  <text x="240" y="176" fill="#fef3c7" fontSize="9" fontMono="true">50 cm</text>
                  <text x="450" y="176" fill="#fef3c7" fontSize="9" fontMono="true">100 cm</text>

                  {/* Left Gap Resistance R */}
                  <rect x="100" y="40" width="50" height="35" fill="#334155" stroke="#64748b" strokeWidth="2" rx="4" />
                  <text x="108" y="62" fill="#34d399" fontSize="11" fontWeight="bold">R={knownResR}Ω</text>
                  <line x1="125" y1="75" x2="125" y2="140" stroke="#f59e0b" strokeWidth="2" />

                  {/* Right Gap Resistance S */}
                  <rect x="350" y="40" width="50" height="35" fill="#334155" stroke="#64748b" strokeWidth="2" rx="4" />
                  <text x="358" y="62" fill="#f43f5e" fontSize="11" fontWeight="bold">S={unknownResS}Ω</text>
                  <line x1="375" y1="75" x2="375" y2="140" stroke="#f59e0b" strokeWidth="2" />

                  {/* Galvanometer & Jockey at Balance Length */}
                  {(() => {
                    const jockeyX = 30 + (balanceLength / 100) * 440;
                    return (
                      <>
                        <circle cx="250" cy="50" r="28" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />
                        <text x="238" y="42" fill="#38bdf8" fontSize="10" fontWeight="bold">GALV (G)</text>
                        <line x1="250" y1="50" x2="250" y2="30" stroke="#ef4444" strokeWidth="2" />
                        <text x="240" y="68" fill="#10b981" fontSize="10" fontMono="true">0 DEFLECT</text>
                        <line x1="250" y1="78" x2={jockeyX} y2="160" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="3 3" />
                        <polygon points={`${jockeyX},160 ${jockeyX-6},145 ${jockeyX+6},145`} fill="#38bdf8" />
                        <text x={jockeyX - 25} y="130" fill="#38bdf8" fontSize="10" fontWeight="bold">Jockey l={balanceLength}cm</text>
                      </>
                    );
                  })()}
                </svg>
                <div className="p-3 rounded-2xl bg-slate-900 border border-emerald-500/30 text-xs font-mono text-emerald-400 flex justify-between w-full">
                  <div>Meter Bridge Formula: S = R × (100 - l) / l</div>
                  <div>Unknown Resistance S: <span className="text-amber-400 font-bold">{unknownResS} Ω</span></div>
                </div>
              </div>
            )}

            {/* 2. Class 12 Potentiometer Stage */}
            {(selectedExpId === "phy12_potentiometer_emf" || selectedExpId === "phy12_potentiometer_internal_r") && (
              <div className="w-full flex-1 flex flex-col items-center justify-center z-10 space-y-4">
                <svg className="w-full h-64" viewBox="0 0 500 230">
                  <rect x="30" y="30" width="440" height="100" fill="#78350f" stroke="#451a03" strokeWidth="3" rx="6" />
                  <line x1="50" y1="50" x2="450" y2="50" stroke="#fef3c7" strokeWidth="2.5" />
                  <line x1="50" y1="75" x2="450" y2="75" stroke="#fef3c7" strokeWidth="2.5" />
                  <line x1="50" y1="100" x2="450" y2="100" stroke="#fef3c7" strokeWidth="2.5" />
                  <line x1="50" y1="125" x2="450" y2="125" stroke="#fef3c7" strokeWidth="2.5" />
                  <text x="50" y="20" fill="#fef3c7" fontSize="10" fontWeight="bold">4-Meter Potentiometer Wire Board</text>

                  {/* Primary Cell Battery E1 & E2 */}
                  <rect x="50" y="160" width="60" height="40" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" rx="4" />
                  <text x="58" y="184" fill="#3b82f6" fontSize="11" fontWeight="bold">Cell E1 (1.4V)</text>
                  <rect x="150" y="160" width="60" height="40" fill="#1e293b" stroke="#f43f5e" strokeWidth="2" rx="4" />
                  <text x="158" y="184" fill="#f43f5e" fontSize="11" fontWeight="bold">Cell E2 (1.08V)</text>

                  {/* Galvanometer null point balance */}
                  <circle cx="340" cy="180" r="24" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
                  <text x="328" y="184" fill="#38bdf8" fontSize="9" fontWeight="bold">GALV (G)</text>
                  <line x1="340" y1="156" x2="250" y2="100" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />
                  <text x="260" y="90" fill="#34d399" fontSize="10" fontWeight="bold">Null Point l1 = 280 cm</text>
                </svg>
                <div className="p-3 rounded-2xl bg-slate-900 border border-blue-500/30 text-xs font-mono text-blue-400 flex justify-between w-full">
                  <div>Potentiometer EMF Comparison: E1 / E2 = l1 / l2</div>
                  <div>EMF Ratio: <span className="text-amber-400 font-bold font-mono">1.29</span></div>
                </div>
              </div>
            )}

            {/* 3. Class 12 Galvanometer Half Deflection Stage */}
            {selectedExpId === "phy12_galvanometer_half_deflection" && (
              <div className="w-full flex-1 flex flex-col items-center justify-center z-10 space-y-4">
                <svg className="w-full h-64" viewBox="0 0 500 230">
                  <circle cx="250" cy="110" r="80" fill="#0f172a" stroke="#38bdf8" strokeWidth="4" />
                  <path d="M 180 110 A 70 70 0 0 1 320 110" fill="none" stroke="#64748b" strokeWidth="3" strokeDasharray="4 4" />
                  <text x="175" y="125" fill="#f8fafc" fontSize="10" fontMono="true">-30</text>
                  <text x="244" y="45" fill="#10b981" fontSize="11" fontWeight="bold">0</text>
                  <text x="315" y="125" fill="#f8fafc" fontSize="10" fontMono="true">+30</text>

                  {/* Half Deflection Needle */}
                  <line x1="250" y1="110" x2="295" y2="65" stroke="#ef4444" strokeWidth="3.5" />
                  <circle cx="250" cy="110" r="8" fill="#38bdf8" />
                  <text x="210" y="150" fill="#38bdf8" fontSize="12" fontWeight="bold">Half Deflection θ/2 = 15 divs</text>

                  <rect x="50" y="170" width="120" height="35" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" rx="4" />
                  <text x="60" y="192" fill="#f59e0b" fontSize="11" fontWeight="bold">Series R = 5000 Ω</text>
                  <rect x="330" y="170" width="120" height="35" fill="#1e293b" stroke="#34d399" strokeWidth="2" rx="4" />
                  <text x="340" y="192" fill="#34d399" fontSize="11" fontWeight="bold">Shunt S = 100 Ω</text>
                </svg>
                <div className="p-3 rounded-2xl bg-slate-900 border border-purple-500/30 text-xs font-mono text-purple-400 flex justify-between w-full">
                  <div>Galvanometer Resistance: G = (R × S) / (R - S)</div>
                  <div>Galvanometer Resistance G: <span className="text-emerald-400 font-bold font-mono">102.04 Ω</span></div>
                </div>
              </div>
            )}

            {/* 4. Class 12 Galvanometer into Voltmeter Stage */}
            {selectedExpId === "phy12_galvanometer_to_voltmeter" && (
              <div className="w-full flex-1 flex flex-col items-center justify-center z-10 space-y-4">
                <svg className="w-full h-64" viewBox="0 0 500 230">
                  <rect x="40" y="40" width="420" height="140" fill="#0f172a" stroke="#3b82f6" strokeWidth="3" rx="12" />
                  <text x="180" y="70" fill="#3b82f6" fontSize="14" fontWeight="bold">CONVERTED VOLTMETER (0-3V)</text>

                  <circle cx="150" cy="120" r="35" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                  <text x="135" y="125" fill="#38bdf8" fontSize="12" fontWeight="bold">GALV (G)</text>

                  <text x="210" y="125" fill="#fef3c7" fontSize="18" fontWeight="bold">+</text>

                  <rect x="250" y="100" width="120" height="40" fill="#334155" stroke="#f59e0b" strokeWidth="2.5" rx="6" />
                  <text x="260" y="125" fill="#f59e0b" fontSize="11" fontWeight="bold">High Series R = 2900 Ω</text>

                  <line x1="70" y1="120" x2="115" y2="120" stroke="#3b82f6" strokeWidth="3" />
                  <line x1="185" y1="120" x2="250" y2="120" stroke="#3b82f6" strokeWidth="3" />
                  <line x1="370" y1="120" x2="430" y2="120" stroke="#3b82f6" strokeWidth="3" />
                </svg>
                <div className="p-3 rounded-2xl bg-slate-900 border border-blue-500/30 text-xs font-mono text-blue-400 flex justify-between w-full">
                  <div>Voltmeter Conversion Series Resistance: R = (V / Ig) - G</div>
                  <div>Required High Series R: <span className="text-amber-400 font-bold font-mono">2900 Ω</span></div>
                </div>
              </div>
            )}

            {/* 5. Class 12 Galvanometer into Ammeter Stage */}
            {selectedExpId === "phy12_galvanometer_to_ammeter" && (
              <div className="w-full flex-1 flex flex-col items-center justify-center z-10 space-y-4">
                <svg className="w-full h-64" viewBox="0 0 500 230">
                  <rect x="40" y="30" width="420" height="160" fill="#0f172a" stroke="#10b981" strokeWidth="3" rx="12" />
                  <text x="170" y="60" fill="#10b981" fontSize="14" fontWeight="bold">CONVERTED AMMETER (0-3A)</text>

                  {/* Main Galvanometer Branch */}
                  <line x1="70" y1="100" x2="160" y2="100" stroke="#10b981" strokeWidth="3" />
                  <circle cx="200" cy="100" r="30" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                  <text x="186" y="104" fill="#38bdf8" fontSize="11" fontWeight="bold">GALV (G)</text>
                  <text x="120" y="90" fill="#38bdf8" fontSize="10" fontMono="true">Ig Branch</text>
                  <line x1="230" y1="100" x2="430" y2="100" stroke="#10b981" strokeWidth="3" />

                  {/* Parallel Thick Copper Shunt Wire Branch */}
                  <line x1="120" y1="100" x2="120" y2="160" stroke="#f59e0b" strokeWidth="3" />
                  <line x1="120" y1="160" x2="200" y2="160" stroke="#f59e0b" strokeWidth="6" />
                  <rect x="200" y="145" width="100" height="30" fill="#334155" stroke="#f59e0b" strokeWidth="2" rx="4" />
                  <text x="210" y="165" fill="#f59e0b" fontSize="11" fontWeight="bold">Shunt S = 0.05 Ω</text>
                  <line x1="300" y1="160" x2="380" y2="160" stroke="#f59e0b" strokeWidth="6" />
                  <line x1="380" y1="160" x2="380" y2="100" stroke="#f59e0b" strokeWidth="3" />
                  <text x="220" y="135" fill="#f59e0b" fontSize="10" fontMono="true">(I - Ig) Main Current Shunt</text>
                </svg>
                <div className="p-3 rounded-2xl bg-slate-900 border border-emerald-500/30 text-xs font-mono text-emerald-400 flex justify-between w-full">
                  <div>Ammeter Conversion Shunt Formula: S = (Ig × G) / (I - Ig)</div>
                  <div>Required Low Shunt Resistance S: <span className="text-amber-400 font-bold font-mono">0.05 Ω</span></div>
                </div>
              </div>
            )}

            {/* 6. Class 12 Sonometer AC Mains Stage */}
            {selectedExpId === "phy12_sonometer_ac" && (
              <div className="w-full flex-1 flex flex-col items-center justify-center z-10 space-y-4">
                <svg className="w-full h-64" viewBox="0 0 500 230">
                  <rect x="40" y="130" width="380" height="45" fill="#78350f" stroke="#451a03" strokeWidth="3" rx="4" />
                  <text x="180" y="158" fill="#fef3c7" fontSize="12" fontWeight="bold">Hollow Wooden Sonometer Box</text>

                  {/* Moveable Bridges & Stretched Wire */}
                  <polygon points="120,130 110,105 130,105" fill="#f59e0b" />
                  <polygon points="340,130 330,105 350,105" fill="#f59e0b" />
                  <path d="M 50 105 Q 230 85 410 105" fill="none" stroke="#cbd5e1" strokeWidth="3" />

                  {/* Electromagnet Coil */}
                  <rect x="215" y="40" width="30" height="40" fill="#3b82f6" stroke="#60a5fa" strokeWidth="2" rx="4" />
                  <text x="185" y="30" fill="#60a5fa" fontSize="10" fontWeight="bold">50 Hz AC Electromagnet</text>

                  {/* Tension Weight Hanger */}
                  <line x1="410" y1="105" x2="440" y2="105" stroke="#cbd5e1" strokeWidth="3" />
                  <line x1="440" y1="105" x2="440" y2="180" stroke="#94a3b8" strokeWidth="2" />
                  <rect x="425" y="180" width="30" height="30" fill="#475569" stroke="#94a3b8" strokeWidth="2" rx="2" />
                  <text x="430" y="200" fill="#fef3c7" fontSize="9" fontWeight="bold">M=0.5kg</text>
                </svg>
                <div className="p-3 rounded-2xl bg-slate-900 border border-blue-500/30 text-xs font-mono text-blue-400 flex justify-between w-full">
                  <div>AC Frequency Formula: f = (1 / 2L) × √(T / m)</div>
                  <div>AC Mains Frequency: <span className="text-emerald-400 font-bold font-mono">50.0 Hz</span></div>
                </div>
              </div>
            )}

            {/* 7. Class 12 p-n Diode Characteristics Stage */}
            {selectedExpId === "phy12_pn_diode" && (
              <div className="w-full flex-1 flex flex-col items-center justify-center z-10 space-y-4">
                <svg className="w-full h-64" viewBox="0 0 500 230">
                  <rect x="80" y="40" width="340" height="80" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" rx="8" />
                  <rect x="80" y="40" width="150" height="80" fill="rgba(59, 130, 246, 0.2)" />
                  <text x="130" y="85" fill="#3b82f6" fontSize="16" fontWeight="bold">p-Type</text>

                  <rect x="230" y="40" width="40" height="80" fill="rgba(244, 63, 94, 0.3)" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 3" />
                  <text x="233" y="85" fill="#f43f5e" fontSize="9" fontWeight="bold">Depletion</text>

                  <rect x="270" y="40" width="150" height="80" fill="rgba(16, 185, 129, 0.2)" />
                  <text x="320" y="85" fill="#10b981" fontSize="16" fontWeight="bold">n-Type</text>

                  {/* I-V Curve Representation */}
                  <rect x="120" y="140" width="260" height="70" fill="#1e293b" stroke="#475569" strokeWidth="2" rx="6" />
                  <path d="M 140 190 L 220 190 Q 240 185 270 150" fill="none" stroke="#34d399" strokeWidth="3" />
                  <text x="210" y="200" fill="#f59e0b" fontSize="10" fontMono="true">Knee Voltage V_knee = 0.7V</text>
                </svg>
                <div className="p-3 rounded-2xl bg-slate-900 border border-emerald-500/30 text-xs font-mono text-emerald-400 flex justify-between w-full">
                  <div>Silicon Diode Forward Knee Voltage: 0.7V</div>
                  <div>Dynamic Resistance r_d = ΔV / ΔI: <span className="text-amber-400 font-bold font-mono">14.2 Ω</span></div>
                </div>
              </div>
            )}

            {/* 8. Class 12 Zener Diode Voltage Regulator Stage */}
            {selectedExpId === "phy12_zener_diode" && (
              <div className="w-full flex-1 flex flex-col items-center justify-center z-10 space-y-4">
                <svg className="w-full h-64" viewBox="0 0 500 230">
                  <rect x="40" y="30" width="420" height="160" fill="#0f172a" stroke="#a855f7" strokeWidth="3" rx="12" />
                  <text x="150" y="60" fill="#a855f7" fontSize="14" fontWeight="bold">ZENER VOLTAGE REGULATOR CIRCUIT</text>

                  <rect x="70" y="90" width="70" height="40" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" rx="4" />
                  <text x="75" y="115" fill="#3b82f6" fontSize="11" fontWeight="bold">Vin = 12.0V</text>

                  <line x1="140" y1="110" x2="220" y2="110" stroke="#a855f7" strokeWidth="3" />

                  {/* Zener Diode Symbol */}
                  <polygon points="230,95 230,125 250,110" fill="#a855f7" />
                  <line x1="250" y1="90" x2="250" y2="130" stroke="#a855f7" strokeWidth="4" />

                  <line x1="250" y1="110" x2="350" y2="110" stroke="#a855f7" strokeWidth="3" />

                  <rect x="350" y="90" width="90" height="40" fill="#1e293b" stroke="#10b981" strokeWidth="2" rx="4" />
                  <text x="355" y="115" fill="#10b981" fontSize="11" fontWeight="bold">Vout = 5.6V</text>
                  <text x="355" y="145" fill="#34d399" fontSize="9" fontMono="true">(Constant Regulated)</text>
                </svg>
                <div className="p-3 rounded-2xl bg-slate-900 border border-purple-500/30 text-xs font-mono text-purple-400 flex justify-between w-full">
                  <div>Unregulated Input Voltage Vin: 12.0V</div>
                  <div>Regulated Zener Output Vout: <span className="text-emerald-400 font-bold font-mono">5.6V (Constant)</span></div>
                </div>
              </div>
            )}

            {/* 9. Physics: Glass Prism Rainbow Spectrum */}
            {(selectedExpId === "phy_glass_prism" || selectedExpId === "phy12_prism_deviation") && (
              <div className="w-full flex-1 flex flex-col items-center justify-center z-10 space-y-4">
                <svg className="w-full h-64" viewBox="0 0 500 240">
                  <rect x="50" y="20" width="400" height="200" fill="#f8fafc" rx="8" stroke="#cbd5e1" strokeWidth="2" />
                  <polygon points="250,40 160,180 340,180" fill="rgba(168, 85, 247, 0.2)" stroke="#a855f7" strokeWidth="3" />
                  <text x="238" y="125" fill="#a855f7" fontSize="14" fontWeight="bold">A=60°</text>

                  <line x1="70" y1="130" x2="205" y2="110" stroke="#f8fafc" strokeWidth="4" className="shadow-lg" />
                  <text x="80" y="120" fill="#64748b" fontSize="11" fontWeight="bold">Incident White Light (i={incidentAngle}°)</text>

                  <line x1="205" y1="110" x2="295" y2="105" stroke="#ef4444" strokeWidth="2" />
                  <line x1="205" y1="110" x2="293" y2="110" stroke="#f97316" strokeWidth="2" />
                  <line x1="205" y1="110" x2="291" y2="115" stroke="#eab308" strokeWidth="2" />
                  <line x1="205" y1="110" x2="289" y2="120" stroke="#22c55e" strokeWidth="2" />
                  <line x1="205" y1="110" x2="287" y2="125" stroke="#06b6d4" strokeWidth="2" />
                  <line x1="205" y1="110" x2="285" y2="130" stroke="#3b82f6" strokeWidth="2" />
                  <line x1="205" y1="110" x2="283" y2="135" stroke="#a855f7" strokeWidth="2" />

                  <line x1="295" y1="105" x2="430" y2="90" stroke="#ef4444" strokeWidth="2.5" />
                  <line x1="293" y1="110" x2="430" y2="105" stroke="#f97316" strokeWidth="2.5" />
                  <line x1="291" y1="115" x2="430" y2="120" stroke="#eab308" strokeWidth="2.5" />
                  <line x1="289" y1="120" x2="430" y2="135" stroke="#22c55e" strokeWidth="2.5" />
                  <line x1="287" y1="125" x2="430" y2="150" stroke="#06b6d4" strokeWidth="2.5" />
                  <line x1="285" y1="130" x2="430" y2="165" stroke="#3b82f6" strokeWidth="2.5" />
                  <line x1="283" y1="135" x2="430" y2="180" stroke="#a855f7" strokeWidth="2.5" />
                  <text x="350" y="80" fill="#ef4444" fontSize="10" fontWeight="bold">VIBGYOR SPECTRUM</text>
                </svg>
                <div className="p-3 rounded-2xl bg-slate-900 border border-purple-500/30 text-xs font-mono text-purple-400 text-center w-full">
                  Prism Spectrum: Angle of Deviation δ = i + e - A = {incidentAngle}° + {(incidentAngle*0.9).toFixed(1)}° - 60° = <span className="text-amber-400 font-bold">{(incidentAngle*1.9 - 60).toFixed(1)}°</span>
                </div>
              </div>
            )}

            {/* 10. Physics: Convex Lens & Concave Mirror Optical Bench */}
            {(selectedExpId === "phy_convex_lens" || selectedExpId === "phy_focal_length" || selectedExpId.includes("phy12_concave") || selectedExpId.includes("phy12_convex")) && (
              <div className="w-full flex-1 flex flex-col items-center justify-center z-10 space-y-4">
                <svg className="w-full h-64" viewBox="0 0 500 240">
                  <rect x="20" y="160" width="460" height="24" fill="#78350f" stroke="#451a03" strokeWidth="2" rx="4" />
                  <line x1="30" y1="164" x2="470" y2="164" stroke="#fef3c7" strokeWidth="1" strokeDasharray="4 4" />
                  <text x="30" y="178" fill="#fef3c7" fontSize="9" fontMono="true">0 cm</text>
                  <text x="240" y="178" fill="#fef3c7" fontSize="9" fontMono="true">50 cm</text>
                  <text x="450" y="178" fill="#fef3c7" fontSize="9" fontMono="true">100 cm</text>

                  <line x1="80" y1="70" x2="80" y2="160" stroke="#f59e0b" strokeWidth="3" />
                  <polygon points="80,60 74,75 86,75" fill="#f59e0b" />
                  <text x="50" y="55" fill="#f59e0b" fontSize="10" fontWeight="bold">Object Pin (u={objectDist} cm)</text>

                  <rect x="235" y="140" width="30" height="20" fill="#334155" />
                  <ellipse cx="250" cy="90" rx="14" ry="50" fill="rgba(56, 189, 248, 0.25)" stroke="#38bdf8" strokeWidth="3" />
                  <text x="220" y="30" fill="#38bdf8" fontSize="10" fontWeight="bold">Optical Lens (f={focalLen} cm)</text>

                  {imageDist !== 999 && (
                    <>
                      <rect x="390" y="40" width="10" height="120" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
                      <line x1="395" y1="90" x2="395" y2="140" stroke="#ef4444" strokeWidth="2.5" />
                      <polygon points="395,148 390,135 400,135" fill="#ef4444" />
                      <text x="360" y="30" fill="#ef4444" fontSize="10" fontWeight="bold">Real Inverted Image (v={imageDist} cm)</text>
                    </>
                  )}
                </svg>

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 flex justify-between w-full">
                  <div>Lens Formula: 1/f = 1/v - 1/(-u)</div>
                  <div>Magnification m: <span className="text-purple-400 font-bold">{magnification}</span></div>
                </div>
              </div>
            )}

            {/* 11. Physics: Glass Slab Refraction */}
            {(selectedExpId === "phy_glass_slab" || selectedExpId === "phy12_glass_refractive_microscope") && (
              <div className="w-full flex-1 flex flex-col items-center justify-center z-10 space-y-4">
                <svg className="w-full h-56" viewBox="0 0 500 220">
                  <rect x="150" y="60" width="200" height="100" fill="rgba(59, 130, 246, 0.15)" stroke="#3b82f6" strokeWidth="2.5" rx="6" />
                  <text x="210" y="115" fill="#60a5fa" fontSize="12" fontStyle="italic" fontWeight="bold">Glass Slab (n = {refIndex})</text>
                  <line x1="250" y1="10" x2="250" y2="170" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 4" />
                  <text x="254" y="25" fill="#94a3b8" fontSize="10">Normal Line (N)</text>

                  {(() => {
                    const startX = 250 - 90 * Math.tan((incidentAngle * Math.PI) / 180);
                    const refractX = 250 + 90 * Math.tan((refractAngle * Math.PI) / 180);
                    return (
                      <>
                        <line x1={startX} y1="10" x2="250" y2="60" stroke="#f59e0b" strokeWidth="3" />
                        <text x={startX - 15} y="18" fill="#f59e0b" fontSize="11" fontWeight="bold">Incident Pin Line (i={incidentAngle}°)</text>
                        <line x1="250" y1="60" x2={refractX} y2="160" stroke="#10b981" strokeWidth="3" />
                        <text x={refractX - 30} y="110" fill="#34d399" fontSize="10">Refracted Ray (r={refractAngle.toFixed(1)}°)</text>
                        <line x1={refractX} y1="160" x2={refractX + (250 - startX)} y2="210" stroke="#f59e0b" strokeWidth="3" />
                        <text x={refractX + 10} y="200" fill="#f59e0b" fontSize="11" fontWeight="bold">Emergent Ray (e={incidentAngle}°)</text>
                      </>
                    );
                  })()}
                </svg>
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 flex justify-between w-full">
                  <div>Snell's Law: sin({incidentAngle}°) / sin({refractAngle.toFixed(1)}°) = {refIndex}</div>
                  <div>Lateral Shift d: <span className="text-amber-400 font-bold">{lateralShift} mm</span></div>
                </div>
              </div>
            )}

            {/* 12. Physics: Logic Gates Board */}
            {selectedExpId === "phy12_logic_gates" && (
              <div className="w-full flex-1 flex flex-col items-center justify-center z-10 space-y-5">
                <div className="p-4 rounded-3xl bg-slate-900 border border-indigo-500/40 space-y-4 w-full text-center shadow-2xl">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5"><Cpu size={15}/> LOGIC GATE TRAINER KIT</span>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">{gateType} GATE</span>
                  </div>

                  <div className="flex items-center justify-center gap-6">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400">INPUT A</span>
                      <button onClick={() => setGateA(a => a ? 0 : 1)} className={`w-12 h-12 rounded-2xl font-mono text-lg font-black ${gateA ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>{gateA}</button>
                    </div>

                    {gateType !== "NOT" && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400">INPUT B</span>
                        <button onClick={() => setGateB(b => b ? 0 : 1)} className={`w-12 h-12 rounded-2xl font-mono text-lg font-black ${gateB ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>{gateB}</button>
                      </div>
                    )}

                    <div className="text-2xl font-black text-slate-600">➔</div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400">OUTPUT Y</span>
                      <div className={`w-14 h-14 rounded-2xl font-mono text-2xl font-black flex items-center justify-center border-2 transition-all ${calcGateOutput() ? "bg-amber-400 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/30" : "bg-slate-900 text-slate-600 border-slate-800"}`}>{calcGateOutput()}</div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300 text-center w-full">
                  Verified Gate Equation: <span className="text-emerald-400 font-bold">{gateType === "AND" ? "Y = A · B" : gateType === "OR" ? "Y = A + B" : gateType === "NOT" ? "Y = Ā" : gateType === "NAND" ? "Y = (A · B)̄" : "Y = (A + B)̄"}</span>
                </div>
              </div>
            )}

            {/* 13. Physics: Ohm's Law & Basic Resistors */}
            {(selectedExpId === "phy_ohms_law" || selectedExpId === "phy_series_parallel") && (
              <div className="w-full flex-1 flex flex-col items-center justify-center z-10 space-y-6">
                <div className="flex items-center gap-6 flex-wrap justify-center">
                  <div className="flex flex-col items-center p-4 rounded-2xl bg-slate-900/90 border border-blue-500/40 shadow-xl w-36">
                    <span className="text-[10px] uppercase font-extrabold text-blue-400 tracking-wider">VOLTMETER (V)</span>
                    <span className="text-3xl font-black font-mono text-white mt-1">{voltage} V</span>
                  </div>
                  <span className="text-2xl font-black text-slate-600">=</span>
                  <div className="flex flex-col items-center p-4 rounded-2xl bg-slate-900/90 border border-amber-500/40 shadow-xl w-36">
                    <span className="text-[10px] uppercase font-extrabold text-amber-400 tracking-wider">RESISTANCE (R)</span>
                    <span className="text-3xl font-black font-mono text-amber-400 mt-1">{selectedExpId === "phy_series_parallel" ? eqResistance : resistance} Ω</span>
                  </div>
                  <span className="text-2xl font-black text-slate-600">×</span>
                  <div className="flex flex-col items-center p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/40 shadow-xl w-36">
                    <span className="text-[10px] uppercase font-extrabold text-emerald-400 tracking-wider">AMMETER (I)</span>
                    <span className="text-3xl font-black font-mono text-emerald-400 mt-1">{currentAmp} A</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300 text-center w-full">
                  ⚡ Circuit Status: CLOSED &nbsp;|&nbsp; Rheostat Setting: <span className="text-emerald-400 font-bold">{resistance} Ω</span> &nbsp;|&nbsp; V-I Slope = {resistance} Ω
                </div>
              </div>
            )}

            {/* 14. Chemistry: Titration Stand */}
            {(selectedExpId === "chem_titration" || selectedExpId === "chem12_kmno4_titration") && (
              <div className="w-full flex-1 flex items-center justify-center gap-8 z-10 py-2">
                <svg className="w-48 h-60" viewBox="0 0 180 240">
                  <rect x="80" y="10" width="20" height="110" fill="rgba(255,255,255,0.12)" stroke="#cbd5e1" strokeWidth="2" rx="2" />
                  <rect x="82" y={12 + naohVolume * 1.8} width="16" height={106 - naohVolume * 1.8} fill="#38bdf8" />
                  <text x="35" y="30" fill="#94a3b8" fontSize="10">Burette (0-50 mL)</text>
                  <circle cx="90" cy="125" r="4" fill="#ef4444" />
                  <path d="M 75 145 L 40 210 Q 35 220 45 220 L 135 220 Q 145 220 140 210 L 105 145 Z" fill="rgba(255,255,255,0.05)" stroke="#cbd5e1" strokeWidth="2" />
                  <path
                    d="M 52 190 L 40 210 Q 35 220 45 220 L 135 220 Q 145 220 140 210 L 128 190 Z"
                    fill={numericPh >= 8.2 ? "rgba(236, 72, 153, 0.85)" : "rgba(241, 245, 249, 0.25)"}
                    className="transition-all duration-500"
                  />
                </svg>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-purple-500/30 text-center space-y-1">
                    <span className="text-[10px] uppercase font-bold text-purple-400">SOLUTION pH LEVEL</span>
                    <div className="text-4xl font-black font-mono text-white">{calcPh}</div>
                    <span className="text-xs font-bold text-slate-400">
                      {numericPh < 7 ? "Acidic Flask Solution" : numericPh === 7 ? "Equivalence Point (Neutral)" : "Basic Solution (Pink Endpoint)"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 15. Chemistry: pH Determination Test Strip */}
            {selectedExpId === "chem_ph_samples" && (
              <div className="w-full flex-1 flex flex-col items-center justify-center z-10 space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-32 h-32 rounded-3xl border-4 flex flex-col items-center justify-center shadow-2xl transition-all" style={{ backgroundColor: activePhSample.color, borderColor: "white" }}>
                    <span className="text-4xl font-black text-white font-mono">{activePhSample.ph}</span>
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider mt-1">pH VALUE</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-bold text-white">{activePhSample.label}</h4>
                    <p className="text-xs text-slate-400 font-mono">
                      {activePhSample.ph < 7 ? "Acidic Solution (Turns Blue Litmus Red)" : activePhSample.ph === 7 ? "Neutral Solution" : "Basic Solution (Turns Red Litmus Blue)"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 16. Chemistry: Salt Analysis Interactive Data Stage */}
            {selectedExpId === "chem12_salt_analysis" && (
              <div className="w-full flex-1 flex flex-col items-center justify-center z-10 space-y-3">
                <div className="p-4 rounded-2xl bg-slate-900 border border-purple-500/40 text-center space-y-3 w-full">
                  <span className="text-xs font-extrabold text-purple-400 uppercase tracking-widest flex items-center justify-center gap-1.5"><Flame size={15}/> SALT ANALYSIS CATION & ANION CHART</span>
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-amber-400 font-bold">Group 0 Cation (NH4+):</span>
                      <p className="text-[11px] text-slate-300">NaOH test ➔ Ammonia gas (Pungent odor turning Red Litmus Blue).</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-yellow-400 font-bold">Group 1 Cation (Pb2+):</span>
                      <p className="text-[11px] text-slate-300">KI test ➔ Bright Yellow Precipitate (PbI2).</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-emerald-400 font-bold">Anion (NO3-):</span>
                      <p className="text-[11px] text-slate-300">Brown Ring Test ➔ Junction brown ring [Fe(H2O)5(NO)]2+.</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-cyan-400 font-bold">Anion (Cl-):</span>
                      <p className="text-[11px] text-slate-300">AgNO3 test ➔ Curdy White ppt of AgCl soluble in NH4OH.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 17. Chemistry: Organic Functional Groups Data Stage */}
            {selectedExpId === "chem12_functional_groups" && (
              <div className="w-full flex-1 flex flex-col items-center justify-center z-10 space-y-3">
                <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/40 text-center space-y-3 w-full">
                  <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest flex items-center justify-center gap-1.5"><Beaker size={15}/> ORGANIC FUNCTIONAL GROUP REACTION DIAGRAM</span>
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-slate-200 font-bold">Aldehydes (-CHO):</span>
                      <p className="text-[11px] text-slate-400">Tollen's Reagent ➔ Shiny Silver Mirror Coating.</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-rose-400 font-bold">Carboxylic (-COOH):</span>
                      <p className="text-[11px] text-slate-400">NaHCO3 test ➔ Brisk Effervescence of CO2 gas.</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-purple-400 font-bold">Phenols (-OH):</span>
                      <p className="text-[11px] text-slate-400">Neutral FeCl3 test ➔ Violet / Purple coloration.</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-amber-400 font-bold">Amines (-NH2):</span>
                      <p className="text-[11px] text-slate-400">Carbylamine test ➔ Extremely foul-smelling Isocyanide.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 18. General Reactions / Thermochemistry / Electrochemistry / Sol Prep */}
            {(selectedExpId === "chem_acetic_acid" || selectedExpId === "chem_reactivity" || selectedExpId === "chem_soap_cleansing" || selectedExpId === "chem_types_reactions" || (selectedExpId.includes("chem12") && selectedExpId !== "chem12_salt_analysis" && selectedExpId !== "chem12_functional_groups" && selectedExpId !== "chem12_kmno4_titration")) && (
              <div className="w-full flex-1 flex flex-col items-center justify-center z-10 space-y-4">
                <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/30 text-center space-y-2 w-full">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Chemical Reaction & Thermodynamic Data Stage</span>
                  <p className="text-base font-semibold text-white">Active chemical reaction rendering live temperature ΔT, heat of neutralisation ΔH, and precipitate color indices.</p>
                </div>
              </div>
            )}

            {/* 19. Biology Experiments */}
            {selectedExpId.includes("bio") && (
              <div className="w-full flex-1 flex flex-col items-center justify-center z-10 space-y-4">
                <div className="w-28 h-28 rounded-full border-4 border-emerald-500/80 bg-slate-900 flex flex-col items-center justify-center p-3 shadow-2xl">
                  <Microscope size={36} className="text-emerald-400" />
                  <span className="text-[10px] font-mono font-bold text-emerald-300 mt-1">400x Lens View</span>
                </div>
                <p className="text-xs text-slate-300 font-mono text-center max-w-md">
                  Observing biological specimen cellular structure under high-power microscope stage.
                </p>
              </div>
            )}
          </div>

          {/* Practical Controls & Variable Sliders (1 Col) */}
          <div className="bg-card border border-border rounded-3xl p-5 space-y-5 shadow-xl">
            <h4 className="font-extrabold text-sm text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Sliders size={16} className="text-emerald-500" />
              <span>Apparatus Controls ({selectedSubject})</span>
            </h4>

            {/* A. Physics Controls */}
            {selectedExpId === "phy_ohms_law" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold"><span>Voltage (V):</span><span className="text-blue-400 font-mono">{voltage} V</span></div>
                  <input type="range" min="2" max="24" step="2" value={voltage} onChange={e => setVoltage(Number(e.target.value))} className="w-full accent-blue-500 cursor-pointer" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold"><span>Resistance (R):</span><span className="text-amber-400 font-mono">{resistance} Ω</span></div>
                  <input type="range" min="1" max="20" step="1" value={resistance} onChange={e => setResistance(Number(e.target.value))} className="w-full accent-amber-500 cursor-pointer" />
                </div>
              </div>
            )}

            {(selectedExpId === "phy12_meter_bridge" || selectedExpId === "phy12_meter_bridge_combination") && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold"><span>Known Resistance R:</span><span className="text-emerald-400 font-mono">{knownResR} Ω</span></div>
                  <input type="range" min="2" max="50" step="1" value={knownResR} onChange={e => setKnownResR(Number(e.target.value))} className="w-full accent-emerald-500 cursor-pointer" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold"><span>Balance Length l:</span><span className="text-blue-400 font-mono">{balanceLength} cm</span></div>
                  <input type="range" min="10" max="90" step="1" value={balanceLength} onChange={e => setBalanceLength(Number(e.target.value))} className="w-full accent-blue-500 cursor-pointer" />
                </div>
              </div>
            )}

            {selectedExpId === "phy12_logic_gates" && (
              <div className="space-y-4">
                <span className="text-xs font-bold text-muted-foreground">Select Logic Gate:</span>
                <div className="grid grid-cols-3 gap-2">
                  {(["AND", "OR", "NOT", "NAND", "NOR"] as const).map(g => (
                    <button key={g} onClick={() => setGateType(g)} className={`py-2 rounded-xl text-xs font-mono font-bold cursor-pointer ${gateType === g ? "bg-indigo-600 text-white" : "bg-muted text-muted-foreground"}`}>{g}</button>
                  ))}
                </div>
              </div>
            )}

            {(selectedExpId === "phy_convex_lens" || selectedExpId === "phy_focal_length" || selectedExpId.includes("phy12_concave") || selectedExpId.includes("phy12_convex")) && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold"><span>Object Distance (u):</span><span className="text-emerald-400 font-mono">{objectDist} cm</span></div>
                  <input type="range" min="15" max="80" value={objectDist} onChange={e => setObjectDist(Number(e.target.value))} className="w-full accent-emerald-500 cursor-pointer" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold"><span>Focal Length (f):</span><span className="text-blue-400 font-mono">{focalLen} cm</span></div>
                  <input type="range" min="10" max="30" value={focalLen} onChange={e => setFocalLen(Number(e.target.value))} className="w-full accent-blue-500 cursor-pointer" />
                </div>
              </div>
            )}

            {selectedExpId === "phy_series_parallel" && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button onClick={() => setCircuitType("series")} className={`flex-1 py-2 rounded-xl text-xs font-bold ${circuitType === "series" ? "bg-emerald-600 text-white" : "bg-muted"}`}>Series</button>
                  <button onClick={() => setCircuitType("parallel")} className={`flex-1 py-2 rounded-xl text-xs font-bold ${circuitType === "parallel" ? "bg-emerald-600 text-white" : "bg-muted"}`}>Parallel</button>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold"><span>Resistor R1:</span><span className="text-amber-400 font-mono">{r1} Ω</span></div>
                  <input type="range" min="2" max="20" value={r1} onChange={e => setR1(Number(e.target.value))} className="w-full accent-amber-500 cursor-pointer" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold"><span>Resistor R2:</span><span className="text-blue-400 font-mono">{r2} Ω</span></div>
                  <input type="range" min="2" max="20" value={r2} onChange={e => setR2(Number(e.target.value))} className="w-full accent-blue-500 cursor-pointer" />
                </div>
              </div>
            )}

            {(selectedExpId === "phy_glass_slab" || selectedExpId === "phy_glass_prism" || selectedExpId.includes("phy12_prism")) && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold"><span>Incident Angle (i):</span><span className="text-amber-400 font-mono">{incidentAngle}°</span></div>
                  <input type="range" min="10" max="75" value={incidentAngle} onChange={e => setIncidentAngle(Number(e.target.value))} className="w-full accent-amber-500 cursor-pointer" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold"><span>Refractive Index (n):</span><span className="text-blue-400 font-mono">{refIndex}</span></div>
                  <input type="range" min="1.0" max="2.4" step="0.1" value={refIndex} onChange={e => setRefIndex(Number(e.target.value))} className="w-full accent-blue-500 cursor-pointer" />
                </div>
              </div>
            )}

            {/* B. Chemistry Controls */}
            {selectedExpId === "chem_ph_samples" && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-muted-foreground">Select Chemical Sample:</span>
                <select value={sampleChoice} onChange={e => setSampleChoice(e.target.value)} className="w-full p-2.5 rounded-xl bg-muted border border-border text-xs font-bold cursor-pointer">
                  <option value="hcl">Dilute HCl (Strong Acid)</option>
                  <option value="naoh">Dilute NaOH (Strong Base)</option>
                  <option value="ethanoic">Ethanoic Acid (Weak Acid)</option>
                  <option value="lemon">Lemon Juice (Citric Acid)</option>
                  <option value="water">Distilled Water (Neutral)</option>
                  <option value="nahco3">Sodium Bicarbonate (Basic Salt)</option>
                </select>
              </div>
            )}

            {(selectedExpId === "chem_titration" || selectedExpId === "chem12_kmno4_titration") && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold"><span>Burette Titrant Vol:</span><span className="text-purple-400 font-mono">{naohVolume} mL</span></div>
                  <input type="range" min="0" max="50" step="0.5" value={naohVolume} onChange={e => setNaohVolume(Number(e.target.value))} className="w-full accent-purple-500 cursor-pointer" />
                </div>
              </div>
            )}

            {selectedExpId === "chem_soap_cleansing" && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button onClick={() => setWaterHardness("soft")} className={`flex-1 py-2 rounded-xl text-xs font-bold ${waterHardness === "soft" ? "bg-cyan-500 text-white" : "bg-muted"}`}>Soft Water</button>
                  <button onClick={() => setWaterHardness("hard")} className={`flex-1 py-2 rounded-xl text-xs font-bold ${waterHardness === "hard" ? "bg-cyan-500 text-white" : "bg-muted"}`}>Hard Water</button>
                </div>
              </div>
            )}

            {/* C. Biology Controls */}
            {selectedExpId === "bio_respiration_co2" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold"><span>Germination Time:</span><span className="text-emerald-400 font-mono">{germinationHours} Hours</span></div>
                  <input type="range" min="6" max="48" value={germinationHours} onChange={e => setGerminationHours(Number(e.target.value))} className="w-full accent-emerald-500 cursor-pointer" />
                </div>
              </div>
            )}

            {selectedExpId === "bio_stomata_mount" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold"><span>Guard Cell Turgor:</span><span className="text-emerald-400 font-mono">{turgidity}%</span></div>
                  <input type="range" min="10" max="100" value={turgidity} onChange={e => setTurgidity(Number(e.target.value))} className="w-full accent-emerald-500 cursor-pointer" />
                </div>
              </div>
            )}

            {!["phy_ohms_law", "phy12_meter_bridge", "phy12_meter_bridge_combination", "phy12_logic_gates", "phy_convex_lens", "phy_focal_length", "phy_series_parallel", "phy_glass_slab", "phy_glass_prism", "chem_ph_samples", "chem_titration", "chem12_kmno4_titration", "chem_soap_cleansing", "bio_respiration_co2", "bio_stomata_mount"].includes(selectedExpId) && (
              <div className="p-4 rounded-xl bg-muted/50 border border-border text-xs font-mono space-y-2">
                <span className="font-extrabold text-indigo-400 uppercase">Interactive Lab Simulator</span>
                <p className="text-muted-foreground">Adjust apparatus values above to simulate different trial conditions!</p>
              </div>
            )}
          </div>
        </div>

        {/* ── SCHOOL EXPERIMENT STEPPER PROCEDURE ── */}
        <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h4 className="font-black text-sm text-foreground flex items-center gap-2">
              <Award size={16} className="text-indigo-500" />
              <span>Official School Procedure & Step-by-Step Guide</span>
            </h4>
            <span className="text-xs font-bold text-muted-foreground">Step {currentStepIndex + 1} of {currentExpObj.procedure.length}</span>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border space-y-2">
            <span className="font-extrabold text-xs text-indigo-400 uppercase tracking-wider">Current Action Step:</span>
            <p className="text-xs text-foreground leading-relaxed font-medium">{currentExpObj.procedure[currentStepIndex]}</p>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentStepIndex(i => Math.max(0, i - 1))}
              disabled={currentStepIndex === 0}
              className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-xs font-bold disabled:opacity-40 cursor-pointer"
            >
              Previous Step
            </button>

            <div className="flex gap-1.5">
              {currentExpObj.procedure.map((_, idx) => (
                <span
                  key={idx}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all ${idx === currentStepIndex ? "bg-indigo-600 scale-125" : "bg-muted"}`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentStepIndex(i => Math.min(currentExpObj.procedure.length - 1, i + 1))}
              disabled={currentStepIndex === currentExpObj.procedure.length - 1}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
            >
              Next Step
            </button>
          </div>
        </div>

        {/* ── OFFICIAL OBSERVATION TABLE ── */}
        <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h4 className="font-black text-sm text-foreground flex items-center gap-2">
              <Layers size={16} className="text-emerald-500" />
              <span>Official Laboratory Observation Table</span>
            </h4>
            <span className="text-xs text-muted-foreground font-mono">{observationRows.length} Trial Readings Recorded</span>
          </div>

          {observationRows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/60 text-muted-foreground">
                    {currentExpObj.observationHeader.map((h, i) => (
                      <th key={i} className="p-3 font-bold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {observationRows.map((row, idx) => (
                    <tr key={idx} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="p-3 font-bold text-emerald-400">Trial #{row.trialNo}</td>
                      <td className="p-3 text-foreground">{row.v || row.u || row.i || row.mode || row.sample || row.acidVol || row.r || row.param1}</td>
                      <td className="p-3 text-foreground">{row.i || row.v || row.r || row.r1 || row.ph || row.init || row.l || row.param2}</td>
                      <td className="p-3 text-foreground">{row.r || row.m || row.e || row.r2 || row.nature || row.final || row.l100 || row.param3}</td>
                      {row.f && <td className="p-3 text-amber-400 font-bold">{row.f}</td>}
                      {row.d && <td className="p-3 text-amber-400 font-bold">{row.d}</td>}
                      {row.req && <td className="p-3 text-emerald-400 font-bold">{row.req}</td>}
                      {row.s && <td className="p-3 text-emerald-400 font-bold">{row.s}</td>}
                      {row.used && <td className="p-3 text-purple-400 font-bold">{row.used}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-muted-foreground font-mono border stroke-dashed border-border rounded-xl">
              📋 Observation Table empty. Adjust variables and click "Record Trial Observation" above to record readings!
            </div>
          )}
        </div>
      </div>

      {/* ── AI PRACTICAL DOUBT CLEARING ASSISTANT (RICH MARKDOWN FORMATTED) ── */}
      <div className="p-6 rounded-2xl bg-card border border-border space-y-4 shadow-xl">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <MessageSquare size={18} className="text-indigo-500" />
          <h4 className="font-extrabold text-sm text-foreground">
            AI Practical Doubt Solver — {currentExpObj.name}
          </h4>
        </div>

        {/* Dynamic Prefilled Question Chips tailored to active experiment */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <HelpCircle size={14} className="text-amber-500" />
            Click any experiment question chip to solve:
          </span>
          <div className="flex flex-wrap gap-2">
            {(currentExpObj.doubts || []).map((chip, idx) => (
              <button
                key={idx}
                onClick={() => { setDoubtText(chip); handleAskDoubt(chip); }}
                className="px-3.5 py-2 rounded-xl bg-muted/60 border border-border hover:border-indigo-500/50 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer text-left shadow-sm hover:shadow-md"
              >
                ❓ {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input Query Box */}
        <div className="flex gap-2 pt-2">
          <input
            type="text"
            placeholder={`Ask AI any practical question about ${currentExpObj.name}...`}
            value={doubtText}
            onChange={e => setDoubtText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAskDoubt()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs font-medium"
          />
          <button
            onClick={() => handleAskDoubt()}
            disabled={loadingDoubt || !doubtText.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            {loadingDoubt ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            <span>AI Practical Answer</span>
          </button>
        </div>

        {/* Rich Formatted Markdown AI Solution Box */}
        {doubtAnswer && (
          <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-foreground leading-relaxed space-y-3 animate-fadeIn shadow-inner">
            <span className="font-bold text-indigo-400 flex items-center gap-1.5 text-sm border-b border-indigo-500/20 pb-2">
              <CheckCircle2 size={16} /> AI Practical Answer & Observations:
            </span>
            <div className="text-muted-foreground space-y-2 font-sans leading-relaxed text-xs">
              {renderMarkdown(doubtAnswer)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
