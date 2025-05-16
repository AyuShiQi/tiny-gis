import { ModuleJSON } from '@/interface/module'

export const workStation: ModuleJSON = {
  id: 1,
  unit: 'meter',
  show: true,
  basePosition: [5, 5, 0],
  objects: [
    {
      id: 'desk-top',
      type: 'box',
      position: [0.0, 0.0, 0.75],
      dimensions: [1.2, 0.6, 0.05],
      color: [0.87, 0.72, 0.53, 1.0]
    },
    { id: 'desk-leg-1', type: 'box', position: [0.55, 0.25, 0.375], dimensions: [0.05, 0.05, 0.75], color: [0.4, 0.4, 0.4, 1.0] },
    { id: 'desk-leg-2', type: 'box', position: [-0.55, 0.25, 0.375], dimensions: [0.05, 0.05, 0.75], color: [0.4, 0.4, 0.4, 1.0] },
    { id: 'desk-leg-3', type: 'box', position: [0.55, -0.25, 0.375], dimensions: [0.05, 0.05, 0.75], color: [0.4, 0.4, 0.4, 1.0] },
    { id: 'desk-leg-4', type: 'box', position: [-0.55, -0.25, 0.375], dimensions: [0.05, 0.05, 0.75], color: [0.4, 0.4, 0.4, 1.0] },

    {
      id: 'monitor',
      type: 'box',
      position: [0.0, -0.2, 1.05],
      dimensions: [0.6, 0.05, 0.4],
      color: [0.2, 0.2, 0.2, 1.0]
    },
    {
      id: 'monitor-stand',
      type: 'box',
      position: [0.0, -0.2, 0.9],
      dimensions: [0.05, 0.05, 0.3],
      color: [0.2, 0.2, 0.2, 1.0]
    },
    {
      id: 'keyboard',
      type: 'box',
      position: [0.0, 0.15, 0.78],
      dimensions: [0.4, 0.15, 0.03],
      color: [0.3, 0.3, 0.3, 1.0]
    },
    {
      id: 'mouse',
      type: 'box',
      position: [0.3, 0.15, 0.78],
      dimensions: [0.08, 0.05, 0.03],
      color: [0.2, 0.2, 0.2, 1.0]
    },

    {
      id: 'chair-seat',
      type: 'box',
      position: [0.0, 0.7, 0.4],
      dimensions: [0.5, 0.5, 0.05],
      color: [0.1, 0.1, 0.6, 1.0]
    },
    {
      id: 'chair-back',
      type: 'box',
      position: [0.0, 0.95, 0.65],
      dimensions: [0.5, 0.05, 0.6],
      color: [0.1, 0.1, 0.6, 1.0]
    },
    { id: 'chair-leg-1', type: 'box', position: [0.2, 0.9, 0.125], dimensions: [0.05, 0.05, 0.55], color: [0.1, 0.1, 0.6, 1.0] },
    { id: 'chair-leg-2', type: 'box', position: [-0.2, 0.9, 0.125], dimensions: [0.05, 0.05, 0.55], color: [0.1, 0.1, 0.6, 1.0] },
    { id: 'chair-leg-3', type: 'box', position: [0.2, 0.5, 0.125], dimensions: [0.05, 0.05, 0.55], color: [0.1, 0.1, 0.6, 1.0] },
    { id: 'chair-leg-4', type: 'box', position: [-0.2, 0.5, 0.125], dimensions: [0.05, 0.05, 0.55], color: [0.1, 0.1, 0.6, 1.0] },

    {
      id: 'cabinet-body',
      type: 'box',
      position: [-0.5, 0.0, 0.375],
      dimensions: [0.4, 0.5, 0.75],
      color: [0.5, 0.4, 0.3, 1.0]
    },
    {
      id: 'drawer-1',
      type: 'box',
      position: [-0.5, 0.0, 0.55],
      dimensions: [0.38, 0.48, 0.15],
      color: [0.6, 0.5, 0.4, 1.0]
    },
    {
      id: 'drawer-2',
      type: 'box',
      position: [-0.5, 0.0, 0.35],
      dimensions: [0.38, 0.48, 0.15],
      color: [0.6, 0.5, 0.4, 1.0]
    }
  ],
  label: {
    id: 'workstation-label',
    type: 'label',
    position: [0.0, 0.0, 1.5],
    text: '工位模型',
    font: '24px sans-serif',
    color: 'black',
    show: true
  }
}
