<template>
  <div class="characters-container">
    <div class="characters-header">
      <LinkButton to="/">
        <p>&#8592; Home</p>
      </LinkButton>
    </div>
    <div class="characters-list">
      <div v-for="character in characters" :key="character.id">
        <a class="person-link" v-bind:href="'/people/' + character.id">
          <div class="character-card">
            <img
              class="character-img"
              v-bind:src="'https://robohash.org/' + character.name"
            />
            <p class="character-name">{{ character.name }}</p>
          </div></a
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  async getStaticProps(ctx) {
    const res = await ctx.fetch("https://swapi.dev/api/people");
    const characters = await res.json();
    return {
      characters: characters.results.map((character, i) => ({
        ...character,
        id: i + 1,
      })),
    };
  },
};
</script>

<style>
.characters-container {
  padding: 0 1rem;
  font-family: sans-serif;
}
.characters-header {
  margin-bottom: 1rem;
}
.characters-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
@media (max-width: 800px) {
  .characters-list {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 560px) {
  .character-container {
    grid-template-columns: repeat(2, 1fr);
  }
}
.person-link {
  text-decoration: none;
  display: inline-block;
}
.character-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
}
.character-card:hover {
  transform: scale(1.02);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}
.character-img {
  max-width: 100%;
}
.character-name {
  font-weight: bold;
  color: black;
}
</style>