'use client'
import { ReactNode } from 'react'

interface PanelProps {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
  bodyClassName?: string
  action?: ReactNode
}

export function Panel({ title, subtitle, children, className = '', bodyClassName = '', action }: PanelProps) {
  return (
    <div className={`panel ${className}`}>
      <div className="panel-head">
        <div style={{ flex: 1 }}>
          <div className="panel-title">{title}</div>
          {subtitle && <div className="panel-sub">{subtitle}</div>}
        </div>
        {action}
      </div>
      <div className={`panel-body ${bodyClassName}`}>{children}</div>
    </div>
  )
}
