import { useState } from "react";
import { useRouter } from "next/router";
import {
  safeSanityFetch,
  urlFor,
  usePreviewSubscription,
  PortableText,
} from "../../lib/sanity";

const recipeQuery = `*[_type == "recipe" && slug.current == $slug][0]{
      _id,
      name,
      slug,
      mainImage,
      ingredient[]{
        _key,
        unit,
        wholeNumber,
        fraction,
        ingredient->{
          name
        }
      },
      instructions,
      likes
    }`;

export default function OneRecipe({ data, preview }) {
  const router = useRouter();
  const { data: previewRecipe } = usePreviewSubscription(recipeQuery, {
    params: { slug: data?.recipe?.slug?.current },
    initialData: data?.recipe,
    enabled: preview,
  });

  const recipe = previewRecipe || data?.recipe;
  const [likes, setLikes] = useState(recipe?.likes ?? 0);

  if (!recipe) return <div>Loading...</div>;

  const addLike = async () => {
    const res = await fetch("/api/handle-like", {
      method: "POST",
      body: JSON.stringify({ _id: recipe._id }),
    }).catch((error) => console.log(error));

    const responseData = await res?.json();
    setLikes(responseData?.likes ?? likes);
  };

  const imageUrl = recipe?.mainImage ? urlFor(recipe.mainImage)?.url() : "/favicon.ico";

  return (
    <article className="recipe">
      <button onClick={() => router.back()} className="back-button">
        ← Back
      </button>
      <h1>{recipe.name}</h1>

      <button className="like-button" onClick={addLike}>
        {likes} ❤️
      </button>

      <main className="content">
        <img src={imageUrl} alt={recipe.name} />
        <div className="breakdown">
          <section>
            <h2>Ingredients</h2>
            {recipe.ingredient?.length > 0 ? (
              <ul className="ingredients">
                {recipe.ingredient.map((ingredient) => (
                  <li key={ingredient._key} className="ingredient">
                    {ingredient?.wholeNumber}
                    {ingredient?.fraction} {ingredient?.unit}
                    <br />
                    {ingredient?.ingredient?.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No ingredients listed.</p>
            )}
          </section>

          <section>
            <h2>Instructions</h2>
            {recipe.instructions?.length > 0 ? (
              <PortableText blocks={recipe.instructions} className="instructions" />
            ) : (
              <p>No instructions available.</p>
            )}
          </section>
        </div>
      </main>
    </article>
  );
}

export async function getStaticPaths() {
  const paths = (await safeSanityFetch(`*[_type == "recipe" && defined(slug.current)]{
      "params": {
        "slug": slug.current
      }
    }`)) || [];

  return {
    paths,
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  const { slug } = params;
  const recipe = await safeSanityFetch(recipeQuery, { slug });
  return { props: { data: { recipe }, preview: false } };
}
