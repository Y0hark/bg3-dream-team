/** État vide explicite : ce qui manque, et quoi faire ensuite. */
export default function EtatVide({ titre, message, action }) {
  return (
    <div className="plaque flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span aria-hidden="true" className="text-3xl opacity-70">
        ⌘
      </span>
      <p className="grave text-base tracking-[0.1em]">{titre}</p>
      {message && <p className="max-w-md text-sm leading-relaxed text-gray-400">{message}</p>}
      {action}
    </div>
  )
}
