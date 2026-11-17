export default function RecordArt({ sticker }: { sticker: string }) {
  return (
    <div className="record-scene" aria-hidden="true">
      <div className="art-caption">SIDE A / GOOD TIMES</div>
      <div className="vinyl">
        <div className="record-label">
          <span>WHO SAMPLED THAT?</span>
          <b>33</b>
          <small>RPM · STEREO</small>
          <i />
        </div>
      </div>
      <div className="record-sleeve">
        <span className="sleeve-top">
          THE ORIGINAL
          <br />
          LISTENING PARTY
        </span>
        <div className="sleeve-title">
          good
          <br />
          <em>vibes.</em>
        </div>
        <div className="sleeve-bottom">
          <span>VOL. 01</span>
          <span>♪ ♫ ♪</span>
        </div>
      </div>
      <div className="art-sticker">{sticker}</div>
      <div className="art-spark spark-one">✳</div>
      <div className="art-spark spark-two">✴</div>
    </div>
  );
}
