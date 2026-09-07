(function () {
    "use strict";
  
    /* ---------- CONFIG ---------- */
    var WHATSAPP_NUMBER = "27739946356"; // 073 994 6356 in international format, no leading 0 or +
  
    /* ---------- STATE ---------- */
    var order = []; // { name, price, size, qty }
  
    /* ---------- ELEMENTS ---------- */
    var bagCount = document.getElementById("bagCount");
    var bagToggle = document.getElementById("bagToggle");
    var drawer = document.getElementById("orderDrawer");
    var drawerOverlay = document.getElementById("drawerOverlay");
    var drawerClose = document.getElementById("drawerClose");
    var drawerItems = document.getElementById("drawerItems");
    var drawerEmpty = document.getElementById("drawerEmpty");
    var drawerTotal = document.getElementById("drawerTotal");
    var sendOrderBtn = document.getElementById("sendOrder");
    var heroWhatsapp = document.getElementById("heroWhatsapp");
    var ctaWhatsapp = document.getElementById("ctaWhatsapp");
  
    /* ---------- BASE WHATSAPP LINKS (before an order exists) ---------- */
    function baseWhatsappLink() {
      var msg = "Hi CAPTURED, I'd like to place an order.";
      return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(msg);
    }
    if (heroWhatsapp) heroWhatsapp.href = baseWhatsappLink();
    if (ctaWhatsapp) ctaWhatsapp.href = baseWhatsappLink();
  
    /* ---------- PRODUCT CARDS ---------- */
    var products = document.querySelectorAll(".product");
  
    products.forEach(function (card) {
      var name = card.getAttribute("data-name");
      var price = parseInt(card.getAttribute("data-price"), 10);
      var sizeButtons = card.querySelectorAll(".size-btn");
      var qtyValue = card.querySelector(".qty-value");
      var qtyButtons = card.querySelectorAll(".qty-btn");
      var addBtn = card.querySelector(".btn-add");
  
      var selectedSize = null;
      var qty = 1;
  
      sizeButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          sizeButtons.forEach(function (b) { b.classList.remove("is-selected"); });
          btn.classList.add("is-selected");
          selectedSize = btn.getAttribute("data-size");
        });
      });
  
      qtyButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var action = btn.getAttribute("data-action");
          if (action === "increase") qty = Math.min(qty + 1, 20);
          if (action === "decrease") qty = Math.max(qty - 1, 1);
          qtyValue.textContent = qty;
        });
      });
  
      addBtn.addEventListener("click", function () {
        if (!selectedSize) {
          showToast("Pick a size first \u2014 S to XXL.");
          card.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
  
        order.push({ name: name, price: price, size: selectedSize, qty: qty });
        updateDrawer();
        showToast(name + " (" + selectedSize + ") added to your order.");
  
        addBtn.textContent = "Added";
        addBtn.classList.add("is-added");
        setTimeout(function () {
          addBtn.textContent = "Add to order";
          addBtn.classList.remove("is-added");
        }, 1100);
  
        // reset this card's controls for the next selection
        qty = 1;
        qtyValue.textContent = qty;
      });
    });
  
    /* ---------- DRAWER RENDERING ---------- */
    function updateDrawer() {
      bagCount.textContent = order.length;
  
      drawerItems.innerHTML = "";
  
      if (order.length === 0) {
        drawerItems.appendChild(drawerEmpty);
        drawerTotal.textContent = "R0";
        return;
      }
  
      var total = 0;
  
      order.forEach(function (item, index) {
        var lineTotal = item.price * item.qty;
        total += lineTotal;
  
        var row = document.createElement("div");
        row.className = "drawer-item";
        row.innerHTML =
          '<div>' +
            '<div class="drawer-item-name">' + item.name + '</div>' +
            '<div class="drawer-item-meta">Size ' + item.size + ' \u00b7 Qty ' + item.qty + '</div>' +
            '<button type="button" class="drawer-item-remove" data-index="' + index + '">Remove</button>' +
          '</div>' +
          '<div class="drawer-item-price">R' + lineTotal + '</div>';
        drawerItems.appendChild(row);
      });
  
      drawerTotal.textContent = "R" + total;
  
      drawerItems.querySelectorAll(".drawer-item-remove").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var i = parseInt(btn.getAttribute("data-index"), 10);
          order.splice(i, 1);
          updateDrawer();
        });
      });
    }
  
    /* ---------- DRAWER OPEN / CLOSE ---------- */
    function openDrawer() {
      drawer.classList.add("is-open");
      drawerOverlay.classList.add("is-open");
    }
    function closeDrawer() {
      drawer.classList.remove("is-open");
      drawerOverlay.classList.remove("is-open");
    }
  
    bagToggle.addEventListener("click", openDrawer);
    drawerClose.addEventListener("click", closeDrawer);
    drawerOverlay.addEventListener("click", closeDrawer);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDrawer();
    });
  
    /* ---------- SEND ORDER TO WHATSAPP ---------- */
    sendOrderBtn.addEventListener("click", function () {
      if (order.length === 0) {
        showToast("Your order is empty \u2014 add a piece first.");
        return;
      }
  
      var lines = ["Hi CAPTURED, I'd like to order:"];
      var total = 0;
  
      order.forEach(function (item) {
        var lineTotal = item.price * item.qty;
        total += lineTotal;
        lines.push("\u2022 " + item.name + " \u2014 Size " + item.size + " \u2014 Qty " + item.qty + " \u2014 R" + lineTotal);
      });
  
      lines.push("");
      lines.push("Total: R" + total);
  
      var message = lines.join("\n");
      var link = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
      window.open(link, "_blank", "noopener");
    });
  
    /* ---------- TOAST ---------- */
    var toastEl = null;
    var toastTimer = null;
  
    function showToast(text) {
      if (!toastEl) {
        toastEl = document.createElement("div");
        toastEl.className = "toast";
        document.body.appendChild(toastEl);
      }
      toastEl.textContent = text;
      requestAnimationFrame(function () {
        toastEl.classList.add("is-visible");
      });
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () {
        toastEl.classList.remove("is-visible");
      }, 2400);
    }
  
    /* ---------- INIT ---------- */
    updateDrawer();
  })();