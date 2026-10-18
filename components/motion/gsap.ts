'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

/**
 * True when the inline head script enabled motion (JS on, no reduced-motion preference).
 * Every animation checks this so the page stays fully readable without it.
 */
export const motionEnabled = () =>
  typeof document !== 'undefined' && document.documentElement.classList.contains('motion')

/** Fired on window once the intro preloader has lifted (or immediately if there is none). */
export const INTRO_EVENT = 'dac:intro'

export { gsap, ScrollTrigger, SplitText, useGSAP }
