import Revelation from './Revelation.jsx'

/** Frontispice de page : sur-titre gravé, titre, filet doré, chapeau. */
export default function EnteteSection({ surtitre, titre, chapeau, aside }) {
  return (
    <Revelation as="header" className="mb-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {surtitre && <p className="glyphe mb-2">{surtitre}</p>}
          <h1 className="grave lueur-titre text-2xl leading-tight tracking-[0.08em] sm:text-3xl">
            {titre}
          </h1>
        </div>
        {aside}
      </div>
      <div className="filet mt-5 max-w-xl" />
      {chapeau && <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-400">{chapeau}</p>}
    </Revelation>
  )
}
