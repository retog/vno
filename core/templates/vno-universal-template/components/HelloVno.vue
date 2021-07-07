<template>
  <div>
    <h1>Welcome to your Vno App!</h1>
    <a class="vno-learn-more" href="#">Read Our Docs</a>
  </div>
</template>

<script>
export default {};
</script>

<style>
div {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
h1 {
  margin-top: 2rem;
  color: #fff;
  font-weight: 200;
}
.vno-learn-more {
  margin-top: 2rem;
  color: #3BA471;
  font-size: 1.2rem;
  text-decoration: none;
  padding: .8rem 1.2rem;
  border: 2px solid #3BA471;
  border-radius: 10px;
  transition: all 200ms ease-in-out;
}

.vno-learn-more:hover {
  color: #fff;
  background: #3ba471;
}
</style>