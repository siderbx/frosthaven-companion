import { toIconSegments } from '../lib/gameIcons'

/**
 * Renders a paraphrased card/perk/mastery string with the Voidwarden glyph tile
 * beside each recognized game term (element, condition, action). Purely
 * presentational — the stored text is unchanged; the word is kept next to its glyph
 * so meaning stays clear and the image is decorative (empty alt / aria-hidden). The
 * nowrap `.game-icon` span keeps the glyph and its word together on one line.
 */
export function CardText({ text }: { text: string }) {
  if (!text) return null
  return (
    <>
      {toIconSegments(text).map((seg, i) =>
        seg.icon ? (
          <span key={i} className="game-icon" title={seg.text}>
            <img className="game-icon-img" src={seg.icon} alt="" aria-hidden="true" /> {seg.text}
          </span>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </>
  )
}
