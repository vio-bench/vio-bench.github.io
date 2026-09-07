import furtherReading from "@/data/further-reading.json";

export function SupplementaryReading() {
  return (
    <section className="further-reading" aria-labelledby="further-reading-heading">
      <h2 id="further-reading-heading">Further reading by topic</h2>
      <table>
        <caption>Additional references organized by subject.</caption>
        <thead>
          <tr><th scope="col">Topic</th><th scope="col">Original material</th></tr>
        </thead>
        <tbody>
          {furtherReading.map((topic) => (
            <tr key={topic.topic}>
              <th scope="row">{topic.topic}</th>
              <td>
                {topic.sources.map((source) => (
                  <div className="further-reading-source" key={source.url + source.locator}>
                    <a href={source.url}>{source.title}</a>
                    <p>{source.locator}</p>
                    {"scope" in source && <p>{source.scope}</p>}
                  </div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
