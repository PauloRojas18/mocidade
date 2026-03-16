'use client'
// LOCALIZAÇÃO: components/CustomSelect.tsx

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
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
  const [open,    setOpen]    = useState(false)
  const [pos,     setPos]     = useState({ top: 0, left: 0, width: 0 })
  const triggerRef            = useRef<HTMLButtonElement>(null)
  const dropdownRef           = useRef<HTMLDivElement>(null)

  const selected = options.find(o => String(o.value) === String(value))

  // Calcula a posição do dropdown com base no trigger
  const calcPos = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setPos({
      top:   rect.bottom + window.scrollY + 4,
      left:  rect.left   + window.scrollX,
      width: rect.width,
    })
  }, [])

  const handleOpen = () => {
    calcPos()
    setOpen(o => !o)
  }

  // Fecha ao clicar fora (trigger ou dropdown)
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Fecha ao pressionar Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  // Recalcula posição ao fazer scroll ou resize
  useEffect(() => {
    if (!open) return
    const update = () => calcPos()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open, calcPos])

  const dropdown = open ? (
    <div
      ref={dropdownRef}
      style={{
        position:     'absolute',
        top:          pos.top,
        left:         pos.left,
        width:        pos.width,
        zIndex:       9999,
        background:   '#fff',
        border:       '1px solid #E2E8F0',
        borderRadius: 12,
        boxShadow:    '0 8px 24px rgba(15,23,42,0.12), 0 2px 6px rgba(15,23,42,0.06)',
        maxHeight:    220,
        overflowY:    'auto',
      }}
    >
      {/* Opção vazia / placeholder */}
      {placeholder && (
        <button
          type="button"
          onClick={() => { onChange(''); setOpen(false) }}
          className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-left"
          style={{
            background: !value ? accentLight : 'transparent',
            color:      !value ? accentText  : '#94A3B8',
          }}
          onMouseEnter={e => { if (value) (e.currentTarget).style.background = '#F8FAFC' }}
          onMouseLeave={e => { if (value) (e.currentTarget).style.background = 'transparent' }}
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
            className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-left"
            style={{
              background: isSelected ? accentLight : 'transparent',
              color:      isSelected ? accentText  : '#1A2340',
              borderTop:  i === 0 && placeholder ? '1px solid #F1F5F9' : 'none',
            }}
            onMouseEnter={e => { if (!isSelected) (e.currentTarget).style.background = '#F8FAFC' }}
            onMouseLeave={e => { (e.currentTarget).style.background = isSelected ? accentLight : 'transparent' }}
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
  ) : null

  return (
    <div className="relative w-full">
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
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

      {/* Dropdown via portal — escapa de qualquer overflow/clip */}
      {typeof window !== 'undefined' && dropdown
        ? createPortal(dropdown, document.body)
        : null}
    </div>
  )
}