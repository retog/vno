<template>
  <div class="character-container">
    <div class="character-header">
      <LinkButton to="/people">
        <p>&#8592; back</p>
      </LinkButton>
    </div>
    <div>
      <img class="character-img" v-bind:src="imgUrl" />
      <p class="character-name">{{ character.name }}</p>
      <p class="character-property">
        <span class="character-property-name">Height:</span>
        {{ character.height }} cm
      </p>
      <p class="character-property">
        <span class="character-property-name">Mass:</span>
        {{ character.mass }} kg
      </p>
      <p class="character-property">
        <span class="character-property-name">Birth Year:</span>
        {{ character.birth_year }}
      </p>
      <p class="character-property">
        <span class="character-property-name">Hair Color:</span>
        {{ character.hair_color }}
      </p>
      <p class="character-property">
        <span class="character-property-name">Eye Color:</span>
        {{ character.eye_color }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  async getStaticPaths(ctx) {
    const res = await ctx.fetch("https://swapi.dev/api/people");
    const characters = await res.json();
    return characters.results.map((_, i) => ({
      params: { id: i + 1 },
    }));
  },
  async getStaticProps(ctx) {
    const res = await ctx.fetch(
      `https://swapi.dev/api/people/${ctx.params.id}`
    );
    const character = await res.json();
    return {
      character,
      imgUrl: `https://robohash.org/${character.name}`,
    };
  },
};
</script>

<style>
.character-container {
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: sans-serif;
}
.character-header {
  align-self: flex-start;
}
.character-name {
  font-weight: 500;
  font-size: 1.3rem;
}
.character-property-name {
  font-weight: bold;
}
</style>