<template>
  <a v-bind:href="to">
    <button class="link-button" @click="clickMe"><slot></slot></button>
  </a>
</template>

<script>
export default {
  props: ["to"],
  methods: {
    clickMe() {
      console.log("you clicked me");
    },
  },
};
</script>

<style>
.link-button {
  border: none;
  padding: 10px 12px;
  background-color: rgba(0, 0, 0, 0.03);
  font-weight: bold;
  border-radius: 2px;
  margin: 4px;
}
.link-button:hover {
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.05);
}
.link-button > * {
  margin: 0;
}
</style>