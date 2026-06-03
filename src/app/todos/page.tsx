import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#090a0f] text-white p-6 font-mono border border-white/10 max-w-md mx-auto my-12 relative fui-border shadow-2xl">
      <div className="fui-corner-tl"></div><div className="fui-corner-tr"></div><div className="fui-corner-bl"></div><div className="fui-corner-br"></div>
      <h1 className="text-sm font-bold tracking-widest text-[#3cdcd1] uppercase mb-6 flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-[#3cdcd1] rounded-full animate-pulse" />
        SUPABASE DATA QUERY TEST // TODOS
      </h1>
      
      {todos && todos.length > 0 ? (
        <ul className="w-full space-y-3">
          {todos.map((todo: any) => (
            <li 
              key={todo.id}
              className="p-3 border border-white/5 bg-white/5 text-xs flex justify-between items-center"
            >
              <span>{todo.name}</span>
              <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 border border-emerald-500/20 bg-emerald-950/20">CONNECTED</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center p-8 border border-white/5 bg-white/5 w-full">
          <p className="text-[10px] text-white/40 mb-2">NO RECORDS RETURNED</p>
          <p className="text-[9px] text-white/20 leading-relaxed">
            Ensure a <code className="text-secondary">todos</code> table exists in your Supabase project with a <code className="text-secondary">name</code> text field.
          </p>
        </div>
      )}
    </div>
  )
}
