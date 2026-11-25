import { Component, StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { StillContext } from '../kit/reduced-motion'
import './preview.css'

const moduleMap = new Map(Object.entries(import.meta.glob<{ default: React.ComponentType }>('../../patterns/*/index.tsx')))
class Boundary extends Component<{ children: ReactNode; onError: (message: string) => void }, { error: string | null }> {
  state = { error: null as string | null }
  static getDerivedStateFromError(error: Error) { return { error: error.message } }
  componentDidCatch(error: Error) { this.props.onError(error.message) }
  render() { return this.state.error ? <p role="alert">This example could not render: {this.state.error}. Check the console for details, then replay after fixing it.</p> : this.props.children }
}
export async function mount(name: string, still: boolean, onError: (message: string) => void = () => {}) {
  if (!/^[a-z0-9-]+$/i.test(name)) throw new Error(`Invalid example: ${name}`)
  const load = name === 'contrasts' ? () => import('../../patterns/teaching/contrasts') : moduleMap.get(`../../patterns/${name}/index.tsx`)
  if (!load) throw new Error(`Unknown example: ${name}`)
  const { default: Demo } = await load()
  const rootEl = document.getElementById('root')
  if (rootEl) createRoot(rootEl).render(<StrictMode><div id="example"><Boundary onError={onError}><StillContext.Provider value={still}><Demo /></StillContext.Provider></Boundary></div></StrictMode>)
}
