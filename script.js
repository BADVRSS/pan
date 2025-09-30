// Sistema de gestión de panadería optimizado para APK
class PanaderiaApp {
  constructor() {
    this.productos = []
    this.ventas = []
    this.carrito = []
    this.currentTab = "productos"
    this.editingProductId = null
    this.isReady = false
    this.cambioInicial = 100.0

    this.initializeApp()
  }

  initializeApp() {
    console.log("[v0] Inicializando aplicación de panadería para APK...")

    // Esperar a que el DOM esté listo con múltiples métodos
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.init())
      // Fallback adicional para APK
      setTimeout(() => this.init(), 500)
    } else {
      this.init()
    }
  }

  async init() {
    try {
      console.log("[v0] Iniciando aplicación...")

      // Cargar datos guardados
      this.loadStoredData()

      // Configurar eventos después de un pequeño delay para APK
      setTimeout(() => {
        this.setupEventListeners()
        this.renderProducts()
        this.renderSalesProducts()
        this.updateReports()
        this.isReady = true
        console.log("[v0] Aplicación lista para usar")
      }, 100)
    } catch (error) {
      console.log("[v0] Error en inicialización:", error)
      // Reintentar después de un delay
      setTimeout(() => this.init(), 1000)
    }
  }

  loadStoredData() {
    try {
      console.log("[v0] Cargando datos desde localStorage...")

      // Cargar productos
      const storedProducts = this.getFromStorage("panaderia_productos")
      this.productos = storedProducts || []

      // Cargar ventas
      const storedSales = this.getFromStorage("panaderia_ventas")
      this.ventas = storedSales || []

      const storedCambioInicial = this.getFromStorage("panaderia_cambio_inicial")
      this.cambioInicial = storedCambioInicial || 100.0

      console.log("[v0] Datos cargados:", {
        productos: this.productos.length,
        ventas: this.ventas.length,
        cambioInicial: this.cambioInicial,
      })

      // Si no hay productos, cargar datos de ejemplo
      if (this.productos.length === 0) {
        this.loadSampleData()
      }
    } catch (error) {
      console.log("[v0] Error cargando datos:", error)
      this.productos = []
      this.ventas = []
      this.cambioInicial = 100.0
      this.loadSampleData()
    }
  }

  loadSampleData() {
    console.log("[v0] Cargando datos de ejemplo...")

    this.productos = [
      { id: 1, nombre: "Pan Dulce", precio: 15.0, categoria: "Panes" },
      { id: 2, nombre: "Croissant", precio: 25.0, categoria: "Panes" },
      { id: 3, nombre: "Donas Glaseadas", precio: 8.0, categoria: "Panes" },
      { id: 4, nombre: "Leche Entera", precio: 22.0, categoria: "Lácteos" },
      { id: 5, nombre: "Huevos (Docena)", precio: 35.0, categoria: "Lácteos" },
    ]

    this.saveProducts()
    console.log("[v0] Datos de ejemplo cargados")
  }

  getFromStorage(key) {
    try {
      // Verificar múltiples formas de acceso a localStorage
      let storage = null

      if (typeof localStorage !== "undefined" && localStorage) {
        storage = localStorage
      } else if (typeof window !== "undefined" && window.localStorage) {
        storage = window.localStorage
      }

      if (storage) {
        const data = storage.getItem(key)
        if (data) {
          return JSON.parse(data)
        }
      }

      console.log("[v0] localStorage no disponible para:", key)
      return null
    } catch (error) {
      console.log("[v0] Error accediendo localStorage:", error)
      return null
    }
  }

  setToStorage(key, data) {
    try {
      let storage = null

      if (typeof localStorage !== "undefined" && localStorage) {
        storage = localStorage
      } else if (typeof window !== "undefined" && window.localStorage) {
        storage = window.localStorage
      }

      if (storage) {
        storage.setItem(key, JSON.stringify(data))
        console.log("[v0] Datos guardados:", key)
        return true
      }

      console.log("[v0] localStorage no disponible para guardar:", key)
      return false
    } catch (error) {
      console.log("[v0] Error guardando en localStorage:", error)
      return false
    }
  }

  getTurno(fecha) {
    const hora = new Date(fecha).getHours()
    const minutos = new Date(fecha).getMinutes()
    const tiempoEnMinutos = hora * 60 + minutos

    // Turno mañana: 7:30 - 11:30 (450 - 690 minutos)
    if (tiempoEnMinutos >= 450 && tiempoEnMinutos < 690) {
      return "mañana"
    }
    // Turno tarde: 16:30 - 22:00 (990 - 1320 minutos)
    else if (tiempoEnMinutos >= 990 && tiempoEnMinutos < 1320) {
      return "tarde"
    }
    return null
  }

  setupEventListeners() {
    try {
      console.log("[v0] Configurando event listeners...")

      // Navegación entre tabs
      const navTabs = document.querySelectorAll(".nav-tab")
      if (navTabs.length > 0) {
        navTabs.forEach((tab) => {
          tab.addEventListener("click", (e) => {
            e.preventDefault()
            const tabName = e.target.getAttribute("data-tab")
            if (tabName) {
              this.switchTab(tabName)
            }
          })
        })
      }

      // Modal de productos
      const btnNuevoProducto = document.getElementById("btn-nuevo-producto")
      if (btnNuevoProducto) {
        btnNuevoProducto.addEventListener("click", (e) => {
          e.preventDefault()
          this.openProductModal()
        })
      }

      const modalClose = document.querySelector(".modal-close")
      if (modalClose) {
        modalClose.addEventListener("click", (e) => {
          e.preventDefault()
          this.closeProductModal()
        })
      }

      const btnCancelar = document.getElementById("btn-cancelar")
      if (btnCancelar) {
        btnCancelar.addEventListener("click", (e) => {
          e.preventDefault()
          this.closeProductModal()
        })
      }

      // Formulario de productos
      const formProducto = document.getElementById("form-producto")
      if (formProducto) {
        formProducto.addEventListener("submit", (e) => {
          e.preventDefault()
          this.saveProduct()
        })
      }

      // Carrito de compras
      const btnLimpiarCarrito = document.getElementById("btn-limpiar-carrito")
      if (btnLimpiarCarrito) {
        btnLimpiarCarrito.addEventListener("click", (e) => {
          e.preventDefault()
          this.clearCart()
        })
      }

      const btnProcesarVenta = document.getElementById("btn-procesar-venta")
      if (btnProcesarVenta) {
        btnProcesarVenta.addEventListener("click", (e) => {
          e.preventDefault()
          this.openPaymentModal()
        })
      }

      const modalPagoClose = document.getElementById("modal-pago-close")
      if (modalPagoClose) {
        modalPagoClose.addEventListener("click", (e) => {
          e.preventDefault()
          this.closePaymentModal()
        })
      }

      const btnCancelarPago = document.getElementById("btn-cancelar-pago")
      if (btnCancelarPago) {
        btnCancelarPago.addEventListener("click", (e) => {
          e.preventDefault()
          this.closePaymentModal()
        })
      }

      const btnConfirmarPago = document.getElementById("btn-confirmar-pago")
      if (btnConfirmarPago) {
        btnConfirmarPago.addEventListener("click", (e) => {
          e.preventDefault()
          this.processSale()
        })
      }

      const billeteButtons = document.querySelectorAll(".btn-billete")
      if (billeteButtons.length > 0) {
        billeteButtons.forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.preventDefault()
            const amount = Number.parseFloat(e.target.getAttribute("data-amount"))
            this.selectBillete(amount)
          })
        })
      }

      const paymentMethodButtons = document.querySelectorAll(".btn-payment-method")
      if (paymentMethodButtons.length > 0) {
        paymentMethodButtons.forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.preventDefault()
            const method = e.target.getAttribute("data-method")
            this.selectPaymentMethod(method)
          })
        })
      }

      const montoRecibidoInput = document.getElementById("monto-recibido")
      if (montoRecibidoInput) {
        montoRecibidoInput.addEventListener("input", (e) => {
          this.calculateChange()
        })
      }

      const modalPago = document.getElementById("modal-pago")
      if (modalPago) {
        modalPago.addEventListener("click", (e) => {
          if (e.target.id === "modal-pago") {
            this.closePaymentModal()
          }
        })
      }

      // Filtros de reportes
      const btnFilters = document.querySelectorAll(".btn-filter")
      if (btnFilters.length > 0) {
        btnFilters.forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.preventDefault()
            document.querySelectorAll(".btn-filter").forEach((b) => b.classList.remove("active"))
            e.target.classList.add("active")
            const period = e.target.getAttribute("data-period")
            if (period) {
              this.updateReports(period)
            }
          })
        })
      }

      // Cerrar modal al hacer clic fuera
      const modalProducto = document.getElementById("modal-producto")
      if (modalProducto) {
        modalProducto.addEventListener("click", (e) => {
          if (e.target.id === "modal-producto") {
            this.closeProductModal()
          }
        })
      }

      const btnEditarCambioInicial = document.getElementById("btn-editar-cambio-inicial")
      if (btnEditarCambioInicial) {
        btnEditarCambioInicial.addEventListener("click", (e) => {
          e.preventDefault()
          this.editCambioInicial()
        })
      }

      const btnGuardarCambioInicial = document.getElementById("btn-guardar-cambio-inicial")
      if (btnGuardarCambioInicial) {
        btnGuardarCambioInicial.addEventListener("click", (e) => {
          e.preventDefault()
          this.saveCambioInicial()
        })
      }

      const btnCancelarCambioInicial = document.getElementById("btn-cancelar-cambio-inicial")
      if (btnCancelarCambioInicial) {
        btnCancelarCambioInicial.addEventListener("click", (e) => {
          e.preventDefault()
          this.cancelEditCambioInicial()
        })
      }

      console.log("[v0] Event listeners configurados")
    } catch (error) {
      console.log("[v0] Error configurando event listeners:", error)
    }
  }

  editCambioInicial() {
    const displaySection = document.querySelector(".cambio-inicial-content")
    const formSection = document.getElementById("cambio-inicial-form")
    const input = document.getElementById("input-cambio-inicial")

    if (displaySection) displaySection.style.display = "none"
    if (formSection) formSection.style.display = "block"
    if (input) input.value = this.cambioInicial
  }

  saveCambioInicial() {
    const input = document.getElementById("input-cambio-inicial")
    const newValue = Number.parseFloat(input.value)

    if (isNaN(newValue) || newValue < 0) {
      this.showAlert("Por favor ingresa un valor válido")
      return
    }

    this.cambioInicial = newValue
    this.setToStorage("panaderia_cambio_inicial", this.cambioInicial)

    const displayValue = document.getElementById("cambio-inicial-display")
    if (displayValue) displayValue.textContent = `$${this.cambioInicial.toFixed(2)}`

    this.cancelEditCambioInicial()
    this.showAlert("Cambio inicial actualizado")
  }

  cancelEditCambioInicial() {
    const displaySection = document.querySelector(".cambio-inicial-content")
    const formSection = document.getElementById("cambio-inicial-form")

    if (displaySection) displaySection.style.display = "flex"
    if (formSection) formSection.style.display = "none"
  }

  selectPaymentMethod(method) {
    const buttons = document.querySelectorAll(".btn-payment-method")
    buttons.forEach((btn) => btn.classList.remove("active"))

    const activeButton = document.querySelector(`[data-method="${method}"]`)
    if (activeButton) activeButton.classList.add("active")

    const billetesSection = document.getElementById("billetes-section")
    const montoRecibidoInput = document.getElementById("monto-recibido")
    const btnConfirmar = document.getElementById("btn-confirmar-pago")

    if (method === "exacto") {
      if (billetesSection) billetesSection.style.display = "none"

      const total = this.carrito.reduce((sum, item) => sum + item.cantidad * item.precio, 0)
      if (montoRecibidoInput) montoRecibidoInput.value = total.toFixed(2)

      this.calculateChange()
    } else {
      if (billetesSection) billetesSection.style.display = "block"
      if (montoRecibidoInput) montoRecibidoInput.value = ""
      if (btnConfirmar) btnConfirmar.disabled = true
    }
  }

  selectBillete(amount) {
    const montoRecibidoInput = document.getElementById("monto-recibido")
    if (montoRecibidoInput) {
      montoRecibidoInput.value = amount.toFixed(2)
      this.calculateChange()
    }
  }

  switchTab(tabName) {
    try {
      // Actualizar navegación
      document.querySelectorAll(".nav-tab").forEach((tab) => {
        tab.classList.remove("active")
      })
      const activeTab = document.querySelector(`[data-tab="${tabName}"]`)
      if (activeTab) {
        activeTab.classList.add("active")
      }

      // Mostrar contenido
      document.querySelectorAll(".tab-content").forEach((content) => {
        content.classList.remove("active")
      })
      const activeContent = document.getElementById(tabName)
      if (activeContent) {
        activeContent.classList.add("active")
      }

      this.currentTab = tabName

      // Actualizar datos según el tab
      if (tabName === "reportes") {
        this.updateReports()
        const displayValue = document.getElementById("cambio-inicial-display")
        if (displayValue) displayValue.textContent = `$${this.cambioInicial.toFixed(2)}`
      }
    } catch (error) {
      console.log("[v0] Error cambiando tab:", error)
    }
  }

  // Gestión de productos
  openProductModal(productId = null) {
    try {
      const modal = document.getElementById("modal-producto")
      const title = document.getElementById("modal-title")
      const form = document.getElementById("form-producto")

      if (!modal || !title || !form) {
        console.log("[v0] Error: elementos del modal no encontrados")
        return
      }

      this.editingProductId = productId

      if (productId) {
        const product = this.productos.find((p) => p.id === productId)
        if (product) {
          title.textContent = "Editar Producto"
          const nombreInput = document.getElementById("nombre-producto")
          const precioInput = document.getElementById("precio-producto")
          const categoriaSelect = document.getElementById("categoria-producto")

          if (nombreInput) nombreInput.value = product.nombre
          if (precioInput) precioInput.value = product.precio
          if (categoriaSelect) categoriaSelect.value = product.categoria
        }
      } else {
        title.textContent = "Nuevo Producto"
        form.reset()
      }

      modal.classList.add("active")
    } catch (error) {
      console.log("[v0] Error abriendo modal:", error)
    }
  }

  closeProductModal() {
    try {
      const modal = document.getElementById("modal-producto")
      if (modal) {
        modal.classList.remove("active")
      }
      this.editingProductId = null
    } catch (error) {
      console.log("[v0] Error cerrando modal:", error)
    }
  }

  openPaymentModal() {
    try {
      if (this.carrito.length === 0) {
        this.showAlert("El carrito está vacío")
        return
      }

      const modal = document.getElementById("modal-pago")
      const totalElement = document.getElementById("pago-total")
      const montoRecibidoInput = document.getElementById("monto-recibido")
      const cambioSection = document.getElementById("cambio-section")
      const btnConfirmar = document.getElementById("btn-confirmar-pago")
      const billetesSection = document.getElementById("billetes-section")

      if (!modal) {
        console.log("[v0] Error: modal de pago no encontrado")
        return
      }

      const total = this.carrito.reduce((sum, item) => sum + item.cantidad * item.precio, 0)

      if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`
      if (montoRecibidoInput) montoRecibidoInput.value = ""
      if (cambioSection) cambioSection.style.display = "none"
      if (btnConfirmar) btnConfirmar.disabled = true
      if (billetesSection) billetesSection.style.display = "block"

      const paymentMethodButtons = document.querySelectorAll(".btn-payment-method")
      paymentMethodButtons.forEach((btn) => btn.classList.remove("active"))
      const billeteButton = document.querySelector('[data-method="billete"]')
      if (billeteButton) billeteButton.classList.add("active")

      modal.classList.add("active")
    } catch (error) {
      console.log("[v0] Error abriendo modal de pago:", error)
    }
  }

  closePaymentModal() {
    try {
      const modal = document.getElementById("modal-pago")
      if (modal) {
        modal.classList.remove("active")
      }
    } catch (error) {
      console.log("[v0] Error cerrando modal de pago:", error)
    }
  }

  calculateChange() {
    try {
      const montoRecibidoInput = document.getElementById("monto-recibido")
      const cambioSection = document.getElementById("cambio-section")
      const cambioElement = document.getElementById("cambio-devolver")
      const btnConfirmar = document.getElementById("btn-confirmar-pago")

      if (!montoRecibidoInput || !cambioSection || !cambioElement || !btnConfirmar) {
        return
      }

      const total = this.carrito.reduce((sum, item) => sum + item.cantidad * item.precio, 0)
      const montoRecibido = Number.parseFloat(montoRecibidoInput.value) || 0

      if (montoRecibido >= total && montoRecibido > 0) {
        const cambio = montoRecibido - total
        cambioElement.textContent = `$${cambio.toFixed(2)}`
        cambioSection.style.display = "block"
        btnConfirmar.disabled = false
      } else {
        cambioSection.style.display = "none"
        btnConfirmar.disabled = true
      }
    } catch (error) {
      console.log("[v0] Error calculando cambio:", error)
    }
  }

  async saveProduct() {
    try {
      console.log("[v0] Guardando producto...")

      const nombreInput = document.getElementById("nombre-producto")
      const precioInput = document.getElementById("precio-producto")
      const categoriaSelect = document.getElementById("categoria-producto")

      if (!nombreInput || !precioInput || !categoriaSelect) {
        this.showAlert("Error: No se pudieron encontrar los campos del formulario")
        return
      }

      const nombre = nombreInput.value.trim()
      const precio = Number.parseFloat(precioInput.value)
      const categoria = categoriaSelect.value

      if (!nombre || isNaN(precio) || precio <= 0 || !categoria) {
        this.showAlert("Por favor, completa todos los campos correctamente")
        return
      }

      if (this.editingProductId) {
        // Editar producto existente
        const index = this.productos.findIndex((p) => p.id === this.editingProductId)
        if (index !== -1) {
          this.productos[index] = {
            ...this.productos[index],
            nombre,
            precio,
            categoria,
          }
        }
      } else {
        // Crear nuevo producto
        const newProduct = {
          id: Date.now() + Math.random(),
          nombre,
          precio,
          categoria,
        }
        this.productos.push(newProduct)
      }

      this.saveProducts()
      this.renderProducts()
      this.renderSalesProducts()
      this.closeProductModal()

      this.showAlert("Producto guardado exitosamente")
      console.log("[v0] Producto guardado")
    } catch (error) {
      console.log("[v0] Error guardando producto:", error)
      this.showAlert("Error al guardar el producto")
    }
  }

  showAlert(message) {
    try {
      if (typeof alert !== "undefined") {
        alert(message)
      } else {
        console.log("[v0] Alerta:", message)
        // Fallback para mostrar mensaje en la interfaz
        const alertDiv = document.createElement("div")
        alertDiv.style.cssText = `
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: #333;
          color: white;
          padding: 10px 20px;
          border-radius: 5px;
          z-index: 10000;
        `
        alertDiv.textContent = message
        document.body.appendChild(alertDiv)

        setTimeout(() => {
          if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv)
          }
        }, 3000)
      }
    } catch (error) {
      console.log("[v0] Error mostrando alerta:", error)
    }
  }

  showConfirm(message) {
    try {
      if (typeof confirm !== "undefined") {
        return confirm(message)
      } else {
        console.log("[v0] Confirmación:", message)
        return true // Fallback: asumir confirmación
      }
    } catch (error) {
      console.log("[v0] Error mostrando confirmación:", error)
      return true
    }
  }

  async deleteProduct(productId) {
    if (this.showConfirm("¿Estás seguro de que quieres eliminar este producto?")) {
      this.productos = this.productos.filter((p) => p.id !== productId)

      this.saveProducts()
      this.renderProducts()
      this.renderSalesProducts()
    } else {
      this.showAlert("Error al eliminar el producto")
    }
  }

  renderProducts() {
    const grid = document.getElementById("products-grid")

    if (this.productos.length === 0) {
      grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <h3>No hay productos registrados</h3>
                    <p>Comienza agregando tu primer producto</p>
                    <button class="btn-primary" onclick="app.openProductModal()">+ Agregar Producto</button>
                </div>
            `
      return
    }

    grid.innerHTML = this.productos
      .map(
        (product) => `
            <div class="product-card fade-in">
                <div class="product-header">
                    <div>
                        <div class="product-name">${product.nombre}</div>
                        <div class="product-category">${product.categoria}</div>
                    </div>
                    <div class="product-price">$${product.precio.toFixed(2)}</div>
                </div>
                <div class="product-actions">
                    <button class="btn-secondary btn-small" onclick="app.openProductModal(${product.id})">
                        Editar
                    </button>
                    <button class="btn-secondary btn-small text-danger" onclick="app.deleteProduct(${product.id})">
                        Eliminar
                    </button>
                </div>
            </div>
        `,
      )
      .join("")
  }

  // Sistema de ventas
  renderSalesProducts() {
    const list = document.getElementById("products-sale-list")

    if (this.productos.length === 0) {
      list.innerHTML = `
                <div class="empty-state">
                    <p>No hay productos disponibles para venta</p>
                </div>
            `
      return
    }

    list.innerHTML = this.productos
      .map(
        (product) => `
            <div class="product-sale-item" onclick="app.addToCart(${product.id})">
                <div class="product-sale-info">
                    <div class="product-sale-name">${product.nombre}</div>
                    <div class="product-sale-price">$${product.precio.toFixed(2)}</div>
                </div>
                <button class="btn-primary btn-small">+</button>
            </div>
        `,
      )
      .join("")
  }

  addToCart(productId) {
    const product = this.productos.find((p) => p.id === productId)
    const existingItem = this.carrito.find((item) => item.id === productId)

    if (existingItem) {
      existingItem.cantidad++
    } else {
      this.carrito.push({
        id: product.id,
        nombre: product.nombre,
        precio: product.precio,
        categoria: product.categoria,
        cantidad: 1,
      })
    }

    this.renderCart()
    this.updateTotal()
  }

  removeFromCart(productId) {
    this.carrito = this.carrito.filter((item) => item.id !== productId)
    this.renderCart()
    this.updateTotal()
  }

  updateQuantity(productId, change) {
    const item = this.carrito.find((item) => item.id === productId)
    if (item) {
      item.cantidad += change
      if (item.cantidad <= 0) {
        this.removeFromCart(productId)
      } else {
        this.renderCart()
        this.updateTotal()
      }
    }
  }

  renderCart() {
    const cartItems = document.getElementById("cart-items")

    if (this.carrito.length === 0) {
      cartItems.innerHTML = `
                <div class="empty-state">
                    <p>El carrito está vacío</p>
                </div>
            `
      return
    }

    cartItems.innerHTML = this.carrito
      .map(
        (item) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.nombre}</div>
                    <div class="cart-item-details">
                        ${item.cantidad} x $${item.precio.toFixed(2)} = $${(item.cantidad * item.precio).toFixed(2)}
                    </div>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="app.updateQuantity(${item.id}, -1)">-</button>
                    <span style="margin: 0 8px; font-weight: 600;">${item.cantidad}</span>
                    <button class="quantity-btn" onclick="app.updateQuantity(${item.id}, 1)">+</button>
                    <button class="btn-secondary btn-small text-danger" onclick="app.removeFromCart(${item.id})" style="margin-left: 8px;">
                        ×
                    </button>
                </div>
            </div>
        `,
      )
      .join("")
  }

  updateTotal() {
    const total = this.carrito.reduce((sum, item) => sum + item.cantidad * item.precio, 0)
    document.getElementById("total-venta").textContent = `$${total.toFixed(2)}`
  }

  clearCart() {
    this.carrito = []
    this.renderCart()
    this.updateTotal()
  }

  async processSale() {
    try {
      console.log("[v0] Procesando venta...")

      if (this.carrito.length === 0) {
        this.showAlert("El carrito está vacío")
        return
      }

      const montoRecibidoInput = document.getElementById("monto-recibido")
      const montoRecibido = Number.parseFloat(montoRecibidoInput.value) || 0
      const total = this.carrito.reduce((sum, item) => sum + item.cantidad * item.precio, 0)

      if (montoRecibido < total) {
        this.showAlert("El monto recibido es insuficiente")
        return
      }

      const cambioDevuelto = montoRecibido - total

      const fechaVenta = new Date()
      const turno = this.getTurno(fechaVenta)

      const sale = {
        id: Date.now() + Math.random(),
        fecha: fechaVenta.toISOString(),
        items: [...this.carrito],
        total: total,
        montoRecibido: montoRecibido,
        cambioDevuelto: cambioDevuelto,
        metodoPago: "efectivo",
        turno: turno, // Guardar turno
      }

      this.ventas.unshift(sale)
      this.saveSales()

      this.clearCart()
      this.closePaymentModal()
      this.updateReports()

      this.showAlert(
        `Venta procesada exitosamente!\nTotal: $${total.toFixed(2)}\nRecibido: $${montoRecibido.toFixed(2)}\nCambio: $${cambioDevuelto.toFixed(2)}${turno ? `\nTurno: ${turno}` : ""}`,
      )
      console.log("[v0] Venta procesada:", total)
    } catch (error) {
      console.log("[v0] Error procesando venta:", error)
      this.showAlert("Error al procesar la venta")
    }
  }

  updateReports(period = "dia") {
    const now = new Date()
    let filteredSales = []

    switch (period) {
      case "dia":
        filteredSales = this.ventas.filter((sale) => {
          const saleDate = new Date(sale.fecha)
          return saleDate.toDateString() === now.toDateString()
        })
        break
      case "semana":
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay())
        weekStart.setHours(0, 0, 0, 0)

        filteredSales = this.ventas.filter((sale) => {
          const saleDate = new Date(sale.fecha)
          return saleDate >= weekStart
        })
        break
      case "mes":
        filteredSales = this.ventas.filter((sale) => {
          const saleDate = new Date(sale.fecha)
          return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear()
        })
        break
    }

    this.renderStats(filteredSales, period)
    this.renderCategoryBreakdown(filteredSales)
    this.renderTurnos(filteredSales) // Añadir renderizado de turnos
    this.renderSalesHistory(filteredSales)
  }

  renderStats(sales, period) {
    const totalVentas = sales.reduce((sum, sale) => sum + sale.total, 0)
    const totalProductos = sales.reduce(
      (sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.cantidad, 0),
      0,
    )
    const promedioVenta = sales.length > 0 ? totalVentas / sales.length : 0
    const totalCambio = sales.reduce((sum, sale) => sum + (sale.cambioDevuelto || 0), 0)

    document.getElementById("ventas-dia").textContent = `$${totalVentas.toFixed(2)}`
    document.getElementById("productos-vendidos").textContent = totalProductos
    document.getElementById("promedio-venta").textContent = `$${promedioVenta.toFixed(2)}`
    document.getElementById("cambio-dia").textContent = `$${totalCambio.toFixed(2)}`
  }

  renderTurnos(sales) {
    const ventasMañana = sales.filter((sale) => sale.turno === "mañana")
    const ventasTarde = sales.filter((sale) => sale.turno === "tarde")

    const totalMañana = ventasMañana.reduce((sum, sale) => sum + sale.total, 0)
    const productosMañana = ventasMañana.reduce(
      (sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.cantidad, 0),
      0,
    )

    const totalTarde = ventasTarde.reduce((sum, sale) => sum + sale.total, 0)
    const productosTarde = ventasTarde.reduce(
      (sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.cantidad, 0),
      0,
    )

    const ventasMañanaEl = document.getElementById("ventas-manana")
    const productosMañanaEl = document.getElementById("productos-manana")
    const ventasTardeEl = document.getElementById("ventas-tarde")
    const productosTardeEl = document.getElementById("productos-tarde")

    if (ventasMañanaEl) ventasMañanaEl.textContent = `$${totalMañana.toFixed(2)}`
    if (productosMañanaEl) productosMañanaEl.textContent = productosMañana
    if (ventasTardeEl) ventasTardeEl.textContent = `$${totalTarde.toFixed(2)}`
    if (productosTardeEl) productosTardeEl.textContent = productosTarde
  }

  renderCategoryBreakdown(sales) {
    const categoryCards = document.getElementById("category-cards")

    if (!categoryCards) return

    // Agrupar productos vendidos por categoría
    const categoryData = {}

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const categoria = item.categoria || "Otros"
        if (!categoryData[categoria]) {
          categoryData[categoria] = {
            cantidad: 0,
            total: 0,
          }
        }
        categoryData[categoria].cantidad += item.cantidad
        categoryData[categoria].total += item.cantidad * item.precio
      })
    })

    if (Object.keys(categoryData).length === 0) {
      categoryCards.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <p>No hay datos de categorías para este período</p>
        </div>
      `
      return
    }

    categoryCards.innerHTML = Object.entries(categoryData)
      .map(
        ([categoria, data]) => `
        <div class="category-card fade-in">
          <div class="category-card-title">${categoria}</div>
          <div class="category-card-value">${data.cantidad}</div>
          <div class="category-card-subtitle">$${data.total.toFixed(2)} en ventas</div>
        </div>
      `,
      )
      .join("")
  }

  renderSalesHistory(sales) {
    const table = document.getElementById("sales-table")

    if (sales.length === 0) {
      table.innerHTML = `
                <div class="empty-state">
                    <p>No hay ventas en este período</p>
                </div>
            `
      return
    }

    const tableHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Turno</th>
                        <th>Productos</th>
                        <th>Total</th>
                        <th>Recibido</th>
                        <th>Cambio</th>
                    </tr>
                </thead>
                <tbody>
                    ${sales
                      .map((sale) => {
                        const fecha = new Date(sale.fecha)
                        const productosText = sale.items.map((item) => `${item.cantidad}x ${item.nombre}`).join(", ")
                        const turnoText = sale.turno ? sale.turno.charAt(0).toUpperCase() + sale.turno.slice(1) : "-"

                        return `
                            <tr>
                                <td>${fecha.toLocaleDateString()}</td>
                                <td>${fecha.toLocaleTimeString()}</td>
                                <td>${turnoText}</td>
                                <td>${productosText}</td>
                                <td class="text-success">$${sale.total.toFixed(2)}</td>
                                <td>$${(sale.montoRecibido || sale.total).toFixed(2)}</td>
                                <td class="text-success">$${(sale.cambioDevuelto || 0).toFixed(2)}</td>
                            </tr>
                        `
                      })
                      .join("")}
                </tbody>
            </table>
        `

    table.innerHTML = tableHTML
  }

  saveProducts() {
    const success = this.setToStorage("panaderia_productos", this.productos)
    if (success) {
      console.log("[v0] Productos guardados exitosamente")
    } else {
      console.log("[v0] Error guardando productos")
    }
  }

  saveSales() {
    const success = this.setToStorage("panaderia_ventas", this.ventas)
    if (success) {
      console.log("[v0] Ventas guardadas exitosamente")
    } else {
      console.log("[v0] Error guardando ventas")
    }
  }
}

window.addToCart = (productId) => {
  try {
    if (window.app && window.app.isReady) {
      window.app.addToCart(productId)
    }
  } catch (error) {
    console.log("[v0] Error en addToCart:", error)
  }
}

window.removeFromCart = (productId) => {
  try {
    if (window.app && window.app.isReady) {
      window.app.removeFromCart(productId)
    }
  } catch (error) {
    console.log("[v0] Error en removeFromCart:", error)
  }
}

window.updateQuantity = (productId, change) => {
  try {
    if (window.app && window.app.isReady) {
      window.app.updateQuantity(productId, change)
    }
  } catch (error) {
    console.log("[v0] Error en updateQuantity:", error)
  }
}

window.openProductModal = (productId) => {
  try {
    if (window.app && window.app.isReady) {
      window.app.openProductModal(productId)
    }
  } catch (error) {
    console.log("[v0] Error en openProductModal:", error)
  }
}

window.deleteProduct = (productId) => {
  try {
    if (window.app && window.app.isReady) {
      window.app.deleteProduct(productId)
    }
  } catch (error) {
    console.log("[v0] Error en deleteProduct:", error)
  }
}

let app
try {
  console.log("[v0] Creando aplicación...")
  app = new PanaderiaApp()
  window.app = app
} catch (error) {
  console.log("[v0] Error inicial:", error)

  // Múltiples fallbacks para APK
  setTimeout(() => {
    try {
      app = new PanaderiaApp()
      window.app = app
      console.log("[v0] Aplicación creada con fallback")
    } catch (retryError) {
      console.log("[v0] Error en fallback:", retryError)
    }
  }, 1000)
}
