//Add a description to the data object with the value "A pair of warm, fuzzy socks". Then display the description using an expression in an p element, underneath the h1.
let eventBus = new Vue();

Vue.component('product', {
  props: {
    premium: {
      type: Boolean,
      required: true
    }
  },
  template: `
  <div class="product">

  <div class="product-image">
    <img v-bind:src="image" />
  </div>
    
  <div class="product-info">
    <a :href="url"><h1>{{ title }}</h1></a>
    <p v-if="inStock">In Stock</p>
    <p v-else
      :class="{ outOfStock: !inStock }"
      >Out of Stock</p>
    <h2>{{ description }}</h2>
    <p>Shipping: {{ shipping }}</p>
    <span v-if="onSale">On Sale!</span>
    <product-details :details="details"></product-details>
    <div v-for="(variant, index) in variants"
        :key="variant.id"
        class="color-box"
        :style="{ 'background-color': variant.color }"
        @mouseover="updateProduct(index)"
        >
    </div>
    <p>Sizes:<span v-for="size in sizes">{{ size }} </span></p>
  
    <button v-on:click="addToCart"
            :disabled="!inStock"
            :class="{ disabledButton: !inStock }"
            >Add to Cart</button>
    <button @click="removeFromCart">Remove from Cart</button>
  </div>

  <product-tabs :reviews="reviews"></product-tabs>

</div>
`,
data() { return {
    brand: 'Vue Mastery',
    product: 'Socks',
    description: 'Long and green',
    selected: 0,
    url: 'http://socks.com',
    onSale: true,
    details: ["80% cotton", "20% polyester", "Gender-neutral"],
    variants: [
      {
        id: 2234,
        color: "green",
        image: './assets/socks-green.jpg',
        quantity: 10
      },
      {
        id: 2235,
        color: "blue",
        image: './assets/socks-blue.jpg',
        quantity: 2
      }
    ],
    sizes: ["Small", "Medium", "Large"],
    reviews: [{name:'me', review:'hello', rating: 5, recommend: 'yes'}]
    } 
  },
  methods: {
    addToCart: function() {
      this.$emit('add-to-cart', this.variants[this.selected].id)
    },
    removeFromCart: function() {
     this.$emit('remove-from-cart', this.variants[this.selected].id)
    },
    updateProduct(index) {
      this.selected = index
    }
  },
  computed: {
    inStock() {
      return this.variants[this.selected].quantity
    },
    title() {
      return this.brand + ' ' + this.product
    },
    image() {
      return this.variants[this.selected].image
    },
    showOnSale() {
      if (this.onSale) return this.brand + ' ' + this.product
    },
    shipping() {
      if (this.premium) {
        return "Free"
      }
      return '$2.99'
    }
  },
  mounted() {
    eventBus.$on('review-submitted', productReview => {
      this.reviews.push(productReview)
    })
  }
})

Vue.component('product-details', {
  props: {
    details: {
      type: Array,
      required: true
    }
  },
  template: `
  <ul>
  <li v-for="detail in details">{{ detail }}</li>
</ul>
`
})

Vue.component('product-review', {
  template: `
  <form class="review-form" @submit.prevent="onSubmit">
  <p v-if="errors.length">
    <b>Please correct the following error(s):</b>
    <ul>
      <li v-for="error in errors">{{ error }}</li>
    </ul>
  <p>
    <label for="name">Name:</label>
    <input id="name" v-model="name">
  </p>
  <p>
    <label for="review">Review:</label>
    <textarea id="review" v-model="review"></textarea>
  </p>
  <p>
    <label for="rating">Rating:</label>
    <select id="rating" v-model.number="rating">
      <option>5</option>
      <option>4</option>
      <option>3</option>
      <option>2</option>
      <option>1</option>
    </select>
  </p>
  <p>Would you recommend this product?
  <label for="recommend-yes">Yes</label>
  <input type="radio" id="recommend-yes" name="recommend" v-model="recommend" value="yes">
    <label for="recommend-no">No</label>
    <input type="radio" id="recommend-no" name="recommend" v-model="recommend" value="no">
  </p>
  <p>
    <input type="submit" value="Submit Review">
  </p>
 </form>

  `,
  data() {
    return {
      name: null,
      review: null,
      rating: null,
      recommend: null,
      errors: []
    }
  },
  methods: {
    onSubmit() {
      if (this.name && this.review && this.rating && this.recommend) {
        let productReview = {
          name: this.name,
          review: this.review,
          rating: this.rating,
          recommend: this.recommend
  
        }
        eventBus.$emit('review-submitted', productReview)
        this.name = null
        this.review = null
        this.rating = null
        this.recommend = null
      } else {
        if (!this.name) this.errors.push("Name required.")
        if (!this.review) this.errors.push("Review required.")
        if (!this.rating) this.errors.push("Rating required.")
        if (!this.recommend) this.errors.push("Recommendation required.")
      }
    }
  }
})

Vue.component('product-tabs', {
  props: {
    reviews: {
      type: Array,
      required: true
    }
  },
  template: `
    <div>
      <span class="tab"
          :class="{ activeTab: selectedTab === tab }"
          v-for="(tab, index) in tabs"
          :key="index"
          @click="selectedTab = tab"
          >
          {{ tab }}</span>

    <div v-show="selectedTab === 'Reviews'">
    <h2>Reviews</h2>
    <p v-if="!reviews.length">There are no reviews yet.</p>
    <ul>
      <li v-for="review in reviews">
      <p>{{ review.name }}</p>
      <p>Rating: {{ review.rating }}</p>
      <p>{{ review.review }}</p>
      <p>Recommend? {{ review.recommend }}</p>
      </li>
    </ul>
  </div>

  <product-review v-show="selectedTab === 'Make a Review'"></product-review>

  </div>
  `,
  data() {
    return {
      tabs: ['Reviews', 'Make a Review'],
      selectedTab: 'Reviews'
    }
  }
})

var app = new Vue({
  el: '#app',
  data: {
    premium: false,
    cart: []
  },
  methods: {
    updateCart(id) {
      this.cart.push(id)
    },
    dropFromCart(id) {
      let index = this.cart.indexOf(id)
      if (index !== -1) this.cart.splice(index, 1)
    }
  }
})


