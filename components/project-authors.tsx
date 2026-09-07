import byline from "@/data/authors.json";

export function ProjectAuthors() {
  return (
    <div className="project-byline">
      <ul className="project-authors" aria-label="Authors">
        {byline.authors.map((author) => (
          <li key={author.name}>
            {author.url ? (
              <a href={author.url} rel="author">{author.name}</a>
            ) : author.name}
            <sup>{author.affiliations.join(",")}</sup>
          </li>
        ))}
      </ul>
      <p className="project-affiliations">
        {byline.affiliations.map((affiliation) => (
          <span key={affiliation.id}>
            <sup>{affiliation.id}</sup> {affiliation.name}
          </span>
        ))}
      </p>
    </div>
  );
}
