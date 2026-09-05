import TalkingHearts from './TalkingHearts'
import ProsperityScript from './ProsperityScript'

// Every app in the collection. Add a new entry here and it appears on the
// home screen and gets its own URL automatically.
export const APPS = [
  {
    slug: 'talking-hearts',
    title: 'Talking Hearts',
    tagline: 'Questions for two',
    emoji: '💗',
    accent: '#c9184a',
    component: TalkingHearts,
  },
  {
    slug: 'prosperity',
    title: 'Prosperity',
    tagline: 'Talk script · read-aloud',
    emoji: '🎤',
    accent: '#0f7d83',
    component: ProsperityScript,
  },
]
