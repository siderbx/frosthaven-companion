import type { Dispatch, SetStateAction } from 'react'
import { RESOURCE_TYPES, type CharacterState, type ResourceType } from '../types'
import { resourceIcon } from '../lib/gameIcons'
import { Counter } from './Counter'

interface ResourceTrackerProps {
  character: CharacterState
  onChange: Dispatch<SetStateAction<CharacterState>>
}

export function ResourceTracker({ character, onChange }: ResourceTrackerProps) {
  const setResource = (resource: ResourceType, value: number) =>
    onChange((prev) => ({ ...prev, resources: { ...prev.resources, [resource]: value } }))

  const countOf = (resource: ResourceType) => character.resources?.[resource] ?? 0
  const total = RESOURCE_TYPES.reduce((sum, r) => sum + countOf(r), 0)

  return (
    <div className="resource-section">
      <div className="panel-header">
        <h2>Resources</h2>
        <span className="muted">{total} collected</span>
      </div>
      <div className="resource-grid">
        {RESOURCE_TYPES.map((resource) => (
          <Counter
            key={resource}
            label={resource}
            icon={resourceIcon(resource)}
            value={countOf(resource)}
            min={0}
            onChange={(v) => setResource(resource, v)}
          />
        ))}
      </div>
    </div>
  )
}
