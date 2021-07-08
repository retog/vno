<template>
  <div>
    <h1>Welcome To Your Vno App!</h1>
    <a class="vno-learn-more" href="#">Read Our Docs</a>
  </div>
</template>

<script>
export default {};
</script>

<style>
div {
  text-align: center;
}
h1 {
  margin: 2.2rem 0;
  color: #092D13;
  font-size: 2.3rem;
  font-weight: 200;
}
.vno-learn-more {
  margin-top: 31px !important;
  color: #092D13;
  font-size: 1.2rem;
  text-decoration: none;
  padding: .8rem 1.2rem;
  border: 2px solid #092D13;
  border-radius: 10px;
  transition: all 200ms ease-in-out;
}

.vno-learn-more:hover {
  color: #fff;
  background: #092D13;
}
</style>