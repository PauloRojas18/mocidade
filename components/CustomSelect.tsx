'use client'
// LOCALIZAÇÃO: components/CustomSelect.tsx

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

type Option = { value: string | number; label: string }

type CustomSelectProps = {
  value: string | number
  onChange: (value: string | number) => void
  options: Option[]
  placeholder?: string
  accentColor?: string
  accentLight?: string
  accentText?: string
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  accentColor = '#4B7BF5',
  accentLight = '#EEF2FF',
  accentText  = '#185FA5',
}: CustomSelectProps) {
  const [open,   setOpen]   = useState(false)
  const ref                 = useRef<HTMLDivElement>(null)

  const selected = options.find(o => String(o.value) === String(value))

  // Fecha ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Fecha ao pressionar Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-all outline-none"
        style={{
          border:     open ? `1.5px solid ${accentColor}` : '1px solid #E2E8F0',
          background: '#fff',
          color:      selected ? '#1A2340' : '#94A3B8',
          boxShadow:  open ? `0 0 0 3px ${accentLight}` : 'none',
        }}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          className="flex-shrink-0 ml-2 transition-transform duration-200"
          style={{
            color:     accentColor,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-[200] w-full mt-1.5 rounded-xl overflow-hidden"
          style={{
            background:  '#fff',
            border:      '1px solid #E2E8F0',
            boxShadow:   '0 8px 24px rgba(15,23,42,0.12), 0 2px 6px rgba(15,23,42,0.06)',
            maxHeight:   220,
            overflowY:   'auto',
          }}
        >
          {/* Opção placeholder / vazio */}
          {placeholder && (
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false) }}
              className="w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors text-left"
              style={{
                background: !value ? accentLight : 'transparent',
                color:      !value ? accentText  : '#94A3B8',
              }}
            >
              <span>{placeholder}</span>
              {!value && <Check size={13} strokeWidth={2.5} style={{ color: accentColor }} />}
            </button>
          )}

          {options.map((opt, i) => {
            const isSelected = String(opt.value) === String(value)
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors text-left"
                style={{
                  background:  isSelected ? accentLight : 'transparent',
                  color:       isSelected ? accentText  : '#1A2340',
                  borderTop:   i === 0 && placeholder ? '1px solid #F1F5F9' : 'none',
                }}
                onMouseEnter={e => {
                  if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = isSelected ? accentLight : 'transparent'
                }}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check size={13} strokeWidth={2.5} style={{ color: accentColor, flexShrink: 0 }} />}
              </button>
            )
          })}

          {options.length === 0 && (
            <div className="px-3 py-3 text-xs text-slate-400 text-center">Nenhuma opção disponível</div>
          )}
        </div>
      )}
    </div>
  )
}