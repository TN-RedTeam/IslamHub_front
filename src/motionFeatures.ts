import { domMax } from 'framer-motion';

// Chargé dynamiquement par <LazyMotion> dans App.tsx : le moteur d'animation
// complet (domMax, nécessaire pour layoutId dans la Navigation) part dans un
// chunk asynchrone au lieu du bundle initial.
export default domMax;
